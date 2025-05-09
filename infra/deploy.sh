#!/bin/bash

echo "Deploying the Azure resources..."

# Define resource group parameters
RG_NAME="rg-agent-workshop"
RG_LOCATION="eastus2"
MODEL_NAME="gpt-4o"
AI_HUB_NAME="agent-wksp"
AI_PROJECT_NAME="agent-workshop"
AI_PROJECT_FRIENDLY_NAME="Agent-Service-Workshop"
STORAGE_NAME="agentservicestorage"
AI_SERVICES_NAME="agent-workshop"
MODEL_CAPACITY=140

# Create the resource group
az group create --name "$RG_NAME" --location "$RG_LOCATION"

# Deploy the Azure resources and save output to JSON
az deployment group create \
  --resource-group "$RG_NAME" \
  --template-file main.bicep \
  --parameters aiHubName="$AI_HUB_NAME" \
      aiProjectName="$AI_PROJECT_NAME" \
      aiProjectFriendlyName="$AI_PROJECT_FRIENDLY_NAME" \
      storageName="$STORAGE_NAME" \
      aiServicesName="$AI_SERVICES_NAME" \
      modelName="$MODEL_NAME" \
      modelCapacity="$MODEL_CAPACITY" \
      modelLocation="$RG_LOCATION" > output.json

# Parse the JSON file manually using grep and sed
if [ -f output.json ]; then
  AI_PROJECT_NAME=$(jq -r '.properties.outputs.aiProjectName.value' output.json)
  RESOURCE_GROUP_NAME=$(jq -r '.properties.outputs.resourceGroupName.value' output.json)
  SUBSCRIPTION_ID=$(jq -r '.properties.outputs.subscriptionId.value' output.json)

  # Run the Azure CLI command to get discovery_url
  DISCOVERY_URL=$(az ml workspace show -n "$AI_PROJECT_NAME" --resource-group "$RESOURCE_GROUP_NAME" --query discovery_url -o tsv)

  if [ -n "$DISCOVERY_URL" ]; then
    # Process the discovery_url to extract the HostName
    HOST_NAME=$(echo "$DISCOVERY_URL" | sed -e 's|^https://||' -e 's|/discovery$||')

    # Generate the PROJECT_CONNECTION_STRING
    PROJECT_CONNECTION_STRING="$HOST_NAME;$SUBSCRIPTION_ID;$RESOURCE_GROUP_NAME;$AI_PROJECT_NAME"

    ENV_FILE_PATH="../src/python/workshop/.env"

    # Delete the file if it exists
    [ -f "$ENV_FILE_PATH" ] && rm "$ENV_FILE_PATH"

    # Write to the .env file
    {
      echo "PROJECT_CONNECTION_STRING=\"$PROJECT_CONNECTION_STRING\""
      echo "BING_CONNECTION_NAME=\"groundingwithbingsearch\""
      echo "MODEL_DEPLOYMENT_NAME=\"$MODEL_NAME\""
    } > "$ENV_FILE_PATH"

    CSHARP_PROJECT_PATH="../src/csharp/workshop/AgentWorkshop.Client/AgentWorkshop.Client.csproj"

    # Set the user secrets for the C# project
    dotnet user-secrets set "ConnectionStrings:AiAgentService" "$PROJECT_CONNECTION_STRING" --project "$CSHARP_PROJECT_PATH"
    dotnet user-secrets set "Azure:ModelName" "$MODEL_NAME" --project "$CSHARP_PROJECT_PATH"

    # Delete the output.json file
    rm -f output.json
  else
    echo "Error: discovery_url not found."
  fi
else
  echo "Error: output.json not found."
fi

# Set Variables
subId=$(az account show --query id --output tsv)
objectId=$(az ad signed-in-user show --query id -o tsv)

# Register the Bing Search resource provider
echo "Attempting to register the Bing Search provider"

az provider register --namespace 'Microsoft.Bing'

# Check if the command succeeded based on its exit status
if [ $? -ne 0 ]; then
    echo "Bing Search registration FAILED. The attempt to register the Bing Search resource was unsuccessful, which means you cannot complete the Grounding with Bing Search lab."
    exit 1
fi

# Wait for a few seconds to allow Azure time to process the registration
sleep 10

# Check if the provider is registered successfully
provider_state=$(az provider show --namespace 'Microsoft.Bing' --query "registrationState" -o tsv)

if [ "$provider_state" != "Registered" ]; then
    echo "Bing Search registration FAILED. The attempt to register the Bing Search resource was unsuccessful, which means you cannot complete the Grounding with Bing Search lab."
    exit 1
fi

echo "Bing Search registration succeeded."

#Adding data scientist role
echo "Adding data scientist user role"

az role assignment create --role "f6c7c914-8db3-469d-8ca1-694a8f32e121" \
                          --assignee-object-id "$objectId" \
                          --scope "subscriptions/$subId/resourceGroups/$RG_NAME" \
                          --assignee-principal-type 'User'

# Check if the command failed
if [ $? -ne 0 ]; then
    echo "User role assignment failed."
    exit 1
fi

echo "User role assignment succeeded."