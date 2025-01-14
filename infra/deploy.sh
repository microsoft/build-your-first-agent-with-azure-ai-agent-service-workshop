#!/bin/bash

echo "Deploying the Azure resources..."

# Define resource group parameters
RG_NAME="rg-contoso-agent-workshop"
RG_LOCATION="swedencentral"
MODEL_NAME="gpt-4o"
AI_HUB_NAME="agent-wksp"
AI_PROJECT_NAME="agent-workshop"
STORAGE_NAME="agentservicestorage"
AI_SERVICES_NAME="agent-workshop"
ENV_FILE=".env"

# Create the resource group
az group create --name "$RG_NAME" --location "$RG_LOCATION"

# Deploy the Azure resources and save output to JSON
az deployment group create --resource-group "$RG_NAME" \
  --template-file main.bicep \
  --parameters aiHubName="$AI_HUB_NAME" \
               aiProjectName="$AI_PROJECT_NAME" \
               storageName="$STORAGE_NAME" \
               aiServicesName="$AI_SERVICES_NAME" \
               modelName="$MODEL_NAME" \
               modelLocation="$RG_LOCATION" > output.json

echo "AI Resources deployed successfully."

# Function to extract a value from JSON using Bash tools
extract_json_value() {
    local key=$1
    grep -o "\"$key\": *\"[^\"]*\"" output.json | sed -E "s/\"$key\": *\"([^\"]*)\"/\1/"
}

# Parse the JSON file to extract values
AI_PROJECT_NAME=$(extract_json_value "aiProjectName")
RESOURCE_GROUP_NAME=$(extract_json_value "resourceGroupName")
SUBSCRIPTION_ID=$(extract_json_value "subscriptionId")
BING_GROUNDING_NAME=$(extract_json_value "bingGroundingName")

# Get discovery_url
DISCOVERY_URL=$(az ml workspace show -n "$AI_PROJECT_NAME" --resource-group "$RESOURCE_GROUP_NAME" --query discovery_url -o tsv)

# Check if discovery_url exists
if [ -n "$DISCOVERY_URL" ]; then
    # Extract HostName from discovery_url
    HOST_NAME=$(echo "$DISCOVERY_URL" | sed 's|^https://||;s|/discovery$||')

    # Generate the PROJECT_CONNECTION_STRING
    PROJECT_CONNECTION_STRING="\"$HOST_NAME;$SUBSCRIPTION_ID;$RESOURCE_GROUP_NAME;$AI_PROJECT_NAME\""

    # Delete the .env file if it exists and create a new one
    [ -f "$ENV_FILE" ] && rm -f "$ENV_FILE"

    # Write the updated content to the .env file
    {
        echo "PROJECT_CONNECTION_STRING=$PROJECT_CONNECTION_STRING"
        echo "BING_CONNECTION_NAME=$BING_GROUNDING_NAME"
        echo "MODEL_DEPLOYMENT_NAME=$MODEL_NAME"
    } > "$ENV_FILE"

    echo "Updated .env file:"
    cat "$ENV_FILE"
else
    echo "Error: discovery_url not found."
fi