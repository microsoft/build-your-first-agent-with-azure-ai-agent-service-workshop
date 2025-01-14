Write-Host "Deploying the Azure resources..."

# Define resource group parameters
$RG_NAME = "rg-contoso-agent-workshop"
$RG_LOCATION = "eastus2"
$MODEL_NAME = "gpt-4o"
$AI_HUB_NAME = "agent-wksp"
$AI_PROJECT_NAME = "agent-workshop"
$STORAGE_NAME = "agentservicestorage"
$AI_SERVICES_NAME = "agent-workshop"
$MODEL_CAPACITY = 140

# Create the resource group
az group create --name $RG_NAME --location $RG_LOCATION

# Deploy the Azure resources and save output to JSON
az deployment group create --resource-group $RG_NAME `
  --template-file main.bicep `
  --parameters aiHubName=$AI_HUB_NAME `
      aiProjectName=$AI_PROJECT_NAME `
      storageName=$STORAGE_NAME `
      aiServicesName=$AI_SERVICES_NAME `
      modelName=$MODEL_NAME `
      modelCapacity=$MODEL_CAPACITY `
      modelLocation=$RG_LOCATION | Out-File -FilePath output.json -Encoding utf8

# Parse the JSON file using native PowerShell cmdlets
$jsonData = Get-Content output.json -Raw | ConvertFrom-Json
$outputs = $jsonData.properties.outputs

# Extract values from the JSON object
$aiProjectName = $outputs.aiProjectName.value
$resourceGroupName = $outputs.resourceGroupName.value
$subscriptionId = $outputs.subscriptionId.value
$bingGroundingName = $outputs.bingGroundingName.value

# Run the Azure CLI command to get discovery_url
$discoveryUrl = az ml workspace show -n $aiProjectName --resource-group $resourceGroupName --query discovery_url -o tsv

# Process the discovery_url to extract the HostName
if ($discoveryUrl) {
    $hostName = $discoveryUrl -replace '^https://', '' -replace '/discovery$', ''
    
    # Generate the PROJECT_CONNECTION_STRING with quotes
    $projectConnectionString = "`"$hostName;$subscriptionId;$resourceGroupName;$aiProjectName`""

    $envFilePath = ".env"

    # Delete the file if it exists
    if (Test-Path $envFilePath) {
        Remove-Item -Path $envFilePath -Force
    }

    # Create a new file
    New-Item -Path $envFilePath -ItemType File -Force | Out-Null

    $newLines = "PROJECT_CONNECTION_STRING=$projectConnectionString"
    $newLines = $newLines + "`nBING_CONNECTION_NAME=$bingGroundingName"
    $newLines = $newLines + "`nMODEL_DEPLOYMENT_NAME=$MODEL_NAME"

    # Write the updated content back to the .env file
    $newLines | Set-Content $envFilePath

    # Delete the output.json file
    # Remove-Item -Path output.json -Force
}
else {
    Write-Host "Error: discovery_url not found."
}