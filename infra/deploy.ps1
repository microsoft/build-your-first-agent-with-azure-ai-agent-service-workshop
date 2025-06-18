Write-Host "Deploying the Azure resources..."

# Define resource group parameters
$RG_LOCATION = "eastus"
$MODEL_NAME = "gpt-4o"
$MODEL_VERSION = "2024-11-20"
$AI_PROJECT_FRIENDLY_NAME = "Agent Service Workshop"
$MODEL_CAPACITY = 140

# Deploy the Azure resources and save output to JSON
az deployment sub create `
  --name "azure-ai-agent-service-lab" `
  --location "$RG_LOCATION" `
  --template-file main.bicep `
  --parameters `
      aiProjectFriendlyName="$AI_PROJECT_FRIENDLY_NAME" `
      modelName="$MODEL_NAME" `
      modelCapacity="$MODEL_CAPACITY" `
      modelVersion="$MODEL_VERSION" `
      location="$RG_LOCATION" | Out-File -FilePath output.json -Encoding utf8

# Parse the JSON file using native PowerShell cmdlets
if (-not (Test-Path -Path output.json)) {
    Write-Host "Error: output.json not found."
    exit -1
}

$jsonData = Get-Content output.json -Raw | ConvertFrom-Json
$outputs = $jsonData.properties.outputs

# Extract values from the JSON object
$projectsEndpoint = $outputs.projectsEndpoint.value
$resourceGroupName = $outputs.resourceGroupName.value
$subscriptionId = $outputs.subscriptionId.value
$aiAccountName = $outputs.aiAccountName.value
$aiProjectName = $outputs.aiProjectName.value
$bingResourceName = "groundingwithbingsearch"

$bingConnectionId = "/subscriptions/$subscriptionId/resourceGroups/$resourceGroupName/providers/Microsoft.CognitiveServices/accounts/$aiAccountName/projects/$aiProjectName/connections/$bingResourceName"

if ([string]::IsNullOrEmpty($projectsEndpoint)) {
    Write-Host "Error: projectsEndpoint not found. Possible deployment failure."
    exit -1
}

# Set the path for the .env file
$ENV_FILE_PATH = "../src/python/workshop/.env"

# Delete the file if it exists
if (Test-Path $ENV_FILE_PATH) {
    Remove-Item -Path $ENV_FILE_PATH -Force
}

# Create a new file and write to it
@"
PROJECT_CONNECTION_STRING=$projectsEndpoint
BING_CONNECTION_NAME=$bingConnectionId
MODEL_DEPLOYMENT_NAME="$MODEL_NAME"
"@ | Set-Content -Path $ENV_FILE_PATH

# Set the C# project path
$CSHARP_PROJECT_PATH = "../src/csharp/workshop/AgentWorkshop.Client/AgentWorkshop.Client.csproj"

# Set the user secrets for the C# project
dotnet user-secrets set "ConnectionStrings:AiAgentService" "$projectsEndpoint" --project "$CSHARP_PROJECT_PATH"
dotnet user-secrets set "Azure:ModelName" "$MODEL_NAME" --project "$CSHARP_PROJECT_PATH"
dotnet user-secrets set "Azure:BingConnectionId" "$bingConnectionId" --project "$CSHARP_PROJECT_PATH"

# Delete the output.json file
Remove-Item -Path output.json -Force

# Register the Bing Search resource provider
Write-Host "Attempting to register the Bing Search provider"

$providerResult = az provider register --namespace 'Microsoft.Bing'
if ($LASTEXITCODE -ne 0) {
    Write-Host "Bing Search registration FAILED. The attempt to register the Bing Search resource was unsuccessful, which means you cannot complete the Grounding with Bing Search lab."
    exit 1
}

# Wait for a few seconds to allow Azure time to process the registration
Start-Sleep -Seconds 10

# Check if the provider is registered successfully
$providerState = az provider show --namespace 'Microsoft.Bing' --query "registrationState" -o tsv
if ($providerState -ne "Registered") {
    Write-Host "Bing Search registration FAILED. The attempt to register the Bing Search resource was unsuccessful, which means you cannot complete the Grounding with Bing Search lab."
    exit 1
}

Write-Host "Bing Search registration succeeded."

Write-Host "Adding Azure AI Developer user role"

# Set Variables
$subId = az account show --query id --output tsv
$objectId = az ad signed-in-user show --query id -o tsv

$roleResult = az role assignment create --role "f6c7c914-8db3-469d-8ca1-694a8f32e121" `
                        --assignee-object-id "$objectId" `
                        --scope "subscriptions/$subId/resourceGroups/$resourceGroupName" `
                        --assignee-principal-type 'User'

# Check if the command failed
if ($LASTEXITCODE -ne 0) {
    Write-Host "User role assignment failed."
    exit 1
}

Write-Host "User role assignment succeeded."
