param name string
param location string
param bingAccountName string

// Create a User-Assigned Managed Identity
resource userAssignedIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2018-11-30' = {
  name: '${name}-identity'
  location: location
}

// Deployment Script using User-Assigned Managed Identity
resource bingSearchGroundingScriptSetup 'Microsoft.Resources/deploymentScripts@2020-10-01' = {
  name: '${name}-deployment-script-setup'
  location: location
  kind: 'AzureCLI'
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      // Use the ID of the User-Assigned Managed Identity as the key
      '${userAssignedIdentity.id}': {}
    }
  }
  properties: {
    azCliVersion: '2.37.0'
    retentionInterval: 'PT1H' // Retain the script resource for 1 hour after it ends running
    timeout: 'PT5M' // Five minutes
    cleanupPreference: 'OnSuccess'
    environmentVariables: [
      {
        name: 'SUBSCRIPTION_ID'
        value: subscription().subscriptionId
      }
      {
        name: 'RESOURCE_GROUP_NAME'
        value: resourceGroup().name
      }
      {
        name: 'BING_ACCOUNT_NAME'
        value: bingAccountName
      }
    ]
    forceUpdateTag: guid(subscription().id, resourceGroup().name, name)
    scriptContent: '''
      #!/bin/bash

      az rest --method put \
        --url "https://management.azure.com/subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP_NAME/providers/Microsoft.Bing/accounts/$BING_ACCOUNT_NAME?api-version=2020-06-10" \
        --body '{
            "location": "global",
            "kind": "Bing.Grounding",
            "properties": {
                "statisticsEnabled": false
            },
            "sku": {
                "name": "G1"
            }
        }'
    '''
  }
}

// Role assignment for the User-Assigned Managed Identity
resource roleAssignment 'Microsoft.Authorization/roleAssignments@2020-04-01-preview' = {
  name: guid(subscription().id, resourceGroup().id, userAssignedIdentity.name, 'Contributor') // Unique GUID for the role assignment
  scope: resourceGroup()
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', 'b24988ac-6180-42a0-ab88-20f7382dd24c') // Contributor role
    principalId: userAssignedIdentity.properties.principalId // User-Assigned Managed Identity's principalId
    principalType: 'ServicePrincipal'
  }
}
