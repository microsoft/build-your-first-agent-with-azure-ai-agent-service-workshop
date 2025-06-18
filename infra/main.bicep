targetScope = 'subscription'

// Parameters
@description('Prefix for the resource group and resources')
param resourcePrefix string = 'agent-workshop'

@description('Location of the resource group to create or use for the deployment')
param location string = 'eastus'

@description('Friendly name for your Azure AI resource')
param aiProjectFriendlyName string = 'Agents standard project resource'

@description('Description of your Azure AI resource dispayed in Azure AI Foundry')
param aiProjectDescription string = 'A standard project resource required for the agent setup.'

@description('Set of tags to apply to all resources.')
param tags object = {}

@description('Model name for deployment')
param modelName string = 'gpt-4o'

@description('Model format for deployment')
param modelFormat string = 'OpenAI'

@description('Model version for deployment')
param modelVersion string = '2024-11-20'

@description('Model deployment SKU name')
param modelSkuName string = 'GlobalStandard'

@description('Model deployment capacity')
param modelCapacity int = 140

@description('Unique suffix for the resources')
@maxLength(4)
@minLength(0)
param uniqueSuffix string = substring(uniqueString(subscription().id, resourcePrefix), 0, 4)

var resourceGroupName = toLower('rg-${resourcePrefix}-${uniqueSuffix}')

var defaultTags = {
  source: 'Azure AI Foundry Agents Service lab'
}

var rootTags = union(defaultTags, tags)

// Create resource group
resource rg 'Microsoft.Resources/resourceGroups@2024-11-01' = {
  name: resourceGroupName
  location: location
}

// Calculate the unique suffix
var aiProjectName = toLower('project-${uniqueSuffix}')
var foundryResourceName = toLower('foundry-${uniqueSuffix}')

module foundry 'foundry.bicep' = {
  name: 'foundry-account-deployment'
  scope: rg
  params: {
    aiProjectName: aiProjectName
    location: location
    tags: rootTags
    foundryResourceName: foundryResourceName
  }
}

module foundryProject 'foundry-project.bicep' = {
  name: 'foundry-project-deployment'
  scope: rg
  params: {
    foundryResourceName: foundry.outputs.accountName
    aiProjectName: aiProjectName
    aiProjectFriendlyName: aiProjectFriendlyName
    aiProjectDescription: aiProjectDescription
    location: location
    tags: rootTags
  }
}

module foundryModelDeployment 'foundry-model-deployment.bicep' = {
  name: 'foundry-model-deployment'
  scope: rg
  params: {
    foundryResourceName: foundry.outputs.accountName
    modelName: modelName
    modelFormat: modelFormat
    modelVersion: modelVersion
    modelSkuName: modelSkuName
    modelCapacity: modelCapacity
    tags: rootTags
  }
}

// Outputs
output subscriptionId string = subscription().subscriptionId
output resourceGroupName string = rg.name
output aiAccountName string = foundry.outputs.accountName
output aiProjectName string = foundryProject.outputs.aiProjectName
output projectsEndpoint string = '${foundry.outputs.endpoint}api/projects/${foundryProject.outputs.aiProjectName}'
