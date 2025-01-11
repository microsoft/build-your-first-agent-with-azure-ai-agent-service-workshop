targetScope = 'subscription'

@minLength(1)
@maxLength(64)
@description('Name which is used to generate a short unique hash for each resource')
param name string

@minLength(1)
@description('Primary location for all resources')
@allowed([
  'eastus'
  'eastus2'
  'northcentralus'
  'southcentralus'
  'swedencentral'
  'westus'
  'westus3'
])
param location string

@description('Id of the user or app to assign application roles')
param principalId string = ''

@description('Flag to decide where to create OpenAI role for current user')
param createRoleForUser bool = true

param acaExists bool = false
param allowedOrigins string = ''

param openAiSkuName string = ''
param openAiDeploymentCapacity int = 90
@secure()
param chainlitAuthSecret string
@secure()
param literalApiKey string
param azureOpenAiApiVersion string = '2024-05-01-preview'
@secure()
param assistantPassword string = substring(uniqueString(subscription().id, name, newGuid()), 0, 12)

@description('Whether the deployment is running on GitHub Actions')
param runningOnGh string = ''

var resourceToken = 'a${toLower(uniqueString(subscription().id, name, location))}'
var tags = { 'azd-env-name': name }

resource resourceGroup 'Microsoft.Resources/resourceGroups@2021-04-01' = {
  name: 'rg-${name}'
  location: location
  tags: tags
}

// var prefix = '${name}-${resourceToken}'

var openAiDeploymentName = 'gpt-4o'
var openAiDeploymentVersion = '2024-08-06'

module openAi 'core/ai/cognitiveservices.bicep' = {
  name: 'openai'
  scope: resourceGroup
  params: {
    name: '${resourceToken}-cog'
    location: location
    tags: tags
    sku: {
      name: !empty(openAiSkuName) ? openAiSkuName : 'S0'
    }
    deployments: [
      {
        name: openAiDeploymentName
        model: {
          format: 'OpenAI'
          name: openAiDeploymentName
          version: openAiDeploymentVersion
        }
        sku: {
          name: 'Standard'
          capacity: openAiDeploymentCapacity
        }
      }
    ]
  }
}

module deploymentScriptModule 'script.bicep' = {
  name: 'deploymentAssistantScript'
  scope: resourceGroup
  params: {
    openAiEndpoint: openAi.outputs.endpoint
    location: location
    openAiApiKey: openAi.outputs.key
    openAiModel: openAiDeploymentName
  }
}

module logAnalyticsWorkspace 'core/monitor/loganalytics.bicep' = {
  name: 'loganalytics'
  scope: resourceGroup
  params: {
    name: '${resourceToken}-loganalytics'
    location: location
    tags: tags
  }
}

// Container apps host (including container registry)
module containerApps 'core/host/container-apps.bicep' = {
  name: 'container-apps'
  scope: resourceGroup
  params: {
    name: 'app'
    location: location
    tags: tags
    containerAppsEnvironmentName: '${resourceToken}-containerapps-env'
    containerRegistryName: '${replace(resourceToken, '-', '')}registry'
    logAnalyticsWorkspaceName: logAnalyticsWorkspace.outputs.name
  }
}

// Container app frontend
module aca 'aca.bicep' = {
  name: 'aca'
  scope: resourceGroup
  params: {
    name: replace('${take(resourceToken,19)}-ca', '--', '-')
    location: location
    tags: tags
    identityName: '${resourceToken}-id-aca'
    containerAppsEnvironmentName: containerApps.outputs.environmentName
    containerRegistryName: containerApps.outputs.registryName
    assistantId: deploymentScriptModule.outputs.assistantId
    allowedOrigins: allowedOrigins
    exists: acaExists
    chainlitAuthSecret: chainlitAuthSecret
    literalApiKey: literalApiKey
    openAiEndpoint: openAi.outputs.endpoint
    openAiApiKey: openAi.outputs.key
    azureOpenAiApiVersion: azureOpenAiApiVersion
    openAiDeploymentName: openAiDeploymentName
    userPassword: assistantPassword
  }
}

module openAiRoleUser 'core/security/role.bicep' = if (createRoleForUser && empty(runningOnGh)) {
  scope: resourceGroup
  name: 'openai-role-user'
  params: {
    principalId: principalId
    roleDefinitionId: '5e0bd9bd-7b93-4f28-af87-19fc36ad61bd'
    principalType: 'User'
  }
}

module openAiRoleBackend 'core/security/role.bicep' = {
  scope: resourceGroup
  name: 'openai-role-backend'
  params: {
    principalId: aca.outputs.SERVICE_ACA_IDENTITY_PRINCIPAL_ID
    roleDefinitionId: '5e0bd9bd-7b93-4f28-af87-19fc36ad61bd'
    principalType: 'ServicePrincipal'
  }
}

output AZURE_LOCATION string = location

output AZURE_OPENAI_CHATGPT_DEPLOYMENT string = openAiDeploymentName
output AZURE_OPENAI_ENDPOINT string = openAi.outputs.endpoint
output AZURE_OPENAI_RESOURCE string = openAi.outputs.name
output AZURE_OPENAI_RESOURCE_LOCATION string = openAi.outputs.location
output AZURE_OPENAI_RESOURCE_GROUP string = resourceGroup.name
output AZURE_OPENAI_SKU_NAME string = openAi.outputs.skuName

output SERVICE_ACA_IDENTITY_PRINCIPAL_ID string = aca.outputs.SERVICE_ACA_IDENTITY_PRINCIPAL_ID
output SERVICE_ACA_NAME string = aca.outputs.SERVICE_ACA_NAME
output SERVICE_ACA_URI string = aca.outputs.SERVICE_ACA_URI
output SERVICE_ACA_IMAGE_NAME string = aca.outputs.SERVICE_ACA_IMAGE_NAME

output AZURE_CONTAINER_ENVIRONMENT_NAME string = containerApps.outputs.environmentName
output AZURE_CONTAINER_REGISTRY_ENDPOINT string = containerApps.outputs.registryLoginServer
output AZURE_CONTAINER_REGISTRY_NAME string = containerApps.outputs.registryName

#disable-next-line outputs-should-not-contain-secrets // This password is required for the user to access the assistant
output assistantPassword string = assistantPassword
