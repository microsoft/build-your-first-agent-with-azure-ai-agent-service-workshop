param name string
param location string = resourceGroup().location
param tags object = {}

param identityName string
param containerAppsEnvironmentName string
param containerRegistryName string
param serviceName string = 'aca'
param exists bool
param openAiDeploymentName string
param openAiEndpoint string
param allowedOrigins string = '' // comma separated list of allowed origins - no slash at the end!
@secure()
param chainlitAuthSecret string
@secure()
param literalApiKey string = ''
param azureOpenAiApiVersion string = '2024-05-01-preview'
param assistantId string
param openAiApiKey string
@secure()
param userPassword string

resource acaIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' = {
  name: identityName
  location: location
}


module app 'core/host/container-app-upsert.bicep' = {
  name: '${serviceName}-container-app-module'
  params: {
    name: name
    location: location
    tags: union(tags, { 'azd-service-name': serviceName })
    identityName: acaIdentity.name
    exists: exists
    containerAppsEnvironmentName: containerAppsEnvironmentName
    containerRegistryName: containerRegistryName
    containerCpuCoreCount: '0.25'
    containerMemory: '0.5Gi'
    containerMaxReplicas: 1
    secrets:[
      {
        name: 'azure-openai-deployment'
        value: openAiDeploymentName
      }
      {
        name: 'azure-openai-endpoint'
        value: openAiEndpoint
      }
      {
        name: 'openai-api-key'
        value: openAiApiKey
      }
      {
        name: 'chainlit-auth-secret'
        value: chainlitAuthSecret
      }
      {
        name: 'literal-api-key'
        value: literalApiKey
      }
      {
        name: 'user-password'
        value: userPassword
      }
    ]
    env: [
      {
        name: 'AZURE_OPENAI_DEPLOYMENT'
        secretRef: 'azure-openai-deployment'
      }
      {
        name: 'AZURE_OPENAI_ENDPOINT'
        secretRef: 'azure-openai-endpoint'
      }
      {
        name: 'AZURE_OPENAI_API_KEY'
        secretRef: 'openai-api-key'
      }
      {
        name: 'CHAINLIT_AUTH_SECRET'
        secretRef: 'chainlit-auth-secret'
      }
      {
        name: 'LITERAL_API_KEY'
        secretRef: 'literal-api-key'
      }
      {
        name: 'ASSISTANT_PASSWORD'
        secretRef: 'user-password'
      }
      {
        name: 'ENV'
        value: 'production'
      }
      {
        name: 'ALLOWED_ORIGINS'
        value: allowedOrigins
      }
      {
        name: 'AZURE_OPENAI_API_VERSION'
        value: azureOpenAiApiVersion
      }
      {
        name: 'AZURE_OPENAI_ASSISTANT_ID'
        value: assistantId
      }
    ]
    targetPort: 80
  }
}

output SERVICE_ACA_IDENTITY_PRINCIPAL_ID string = acaIdentity.properties.principalId
output SERVICE_ACA_NAME string = app.outputs.name
output SERVICE_ACA_URI string = app.outputs.uri
output SERVICE_ACA_IMAGE_NAME string = app.outputs.imageName
