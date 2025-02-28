param name string
param location string = resourceGroup().location
param resourceGroupName string
param tags object = {}

param identityName string
param identityId string
param containerAppsEnvironmentName string
param containerRegistryName string
param serviceName string = 'api'
param openAi_4_DeploymentName string
param openAiEndpoint string
param openAiName string
param bingName string
param openAiApiVersion string
param openAiEmbeddingDeploymentName string
param openAiType string
param aiSearchEndpoint string
param aiSearchIndexName string
param appinsights_Connectionstring string
param aiProjectName string
param subscriptionId string

@secure()
param bingApiKey string

param bingApiEndpoint string

param assistantId string
param allowedOrigins string
@secure()
param userPassword string
@secure()
param chainlitAuthSecret string
@secure()
param literalApiKey string
@secure()
param openAiApiKey string

resource acaIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' = {
  name: identityName
  location: location
}


module app '../core/host/container-app-upsert.bicep' = {
  name: '${serviceName}-container-app-module'
  params: {
    name: name
    location: location
    tags: union(tags, { 'azd-service-name': serviceName })
    identityName: acaIdentity.name
    containerAppsEnvironmentName: containerAppsEnvironmentName
    containerRegistryName: containerRegistryName
    containerCpuCoreCount: '0.25'
    containerMemory: '0.5Gi'
    containerMaxReplicas: 1
    secrets: [
      {name: 'bing-search-key'
      value: bingApiKey
      }
      {name: 'openai-api-key'
      value: openAiApiKey
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
        name: 'AZURE_LOCATION'
        value: location
      }
      {
        name: 'AZURE_RESOURCE_GROUP'
        value: resourceGroupName
      }
      {
        name: 'AZURE_SUBSCRIPTION_ID'
        value: subscriptionId
      }
      {
        name: 'AZURE_CLIENT_ID'
        value: identityId
      }
      {
        name: 'AZURE_SEARCH_ENDPOINT'
        value: aiSearchEndpoint
      }
      {
        name: 'AZUREAISEARCH__INDEX_NAME'
        value: aiSearchIndexName
      }
      {
        name: 'OPENAI_TYPE'
        value: openAiType
      }
      {
        name: 'AZURE_OPENAI_API_VERSION'
        value: openAiApiVersion
      }
      {
        name: 'AZURE_OPENAI_ENDPOINT'
        value: openAiEndpoint
      }
      {
        name: 'AZURE_OPENAI_NAME'
        value: openAiName
      }
      {
        name: 'AZURE_OPENAI_DEPLOYMENT_NAME'
        value: openAi_4_DeploymentName
      }
      {
        name: 'AZURE_AI_PROJECT_NAME'
        value: aiProjectName
      }
      {
        name: 'AZURE_EMBEDDING_NAME'
        value: openAiEmbeddingDeploymentName
      }
      {
        name: 'APPINSIGHTS_CONNECTIONSTRING'
        value: appinsights_Connectionstring
      }
      {
        name: 'BING_SEARCH_ENDPOINT'
        value: bingApiEndpoint
      }
      {
        name: 'BING_SEARCH_KEY'
        secretRef: 'bing-search-key'
      }
      {
        name: 'BING_SEARCH_NAME'
        value: bingName
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
        name: 'AZURE_OPENAI_ASSISTANT_ID'
        value: assistantId
      }
    ]
    targetPort: 80
  }
}

output SERVICE_ACA_NAME string = app.outputs.name
output SERVICE_ACA_URI string = app.outputs.uri
output SERVICE_ACA_IMAGE_NAME string = app.outputs.imageName
output SERVICE_ACA_IDENTITY_PRINCIPAL_ID string = acaIdentity.properties.principalId
