param openAiEndpoint string
param location string
param openAiAssistantName string = 'Contoso Sales Assistant'
param openAiModel string
@secure()
param openAiApiKey string

resource deploymentScript 'Microsoft.Resources/deploymentScripts@2023-08-01' = {
  name: 'createOpenAIAssistant'
  location: location
  kind: 'AzureCLI'
  properties: {
    azCliVersion: '2.52.0'
    arguments: openAiApiKey
    environmentVariables: [
      {
        name: 'ENDPOINT'
        value: openAiEndpoint
      }
      {
        name: 'API_KEY'
        value: openAiApiKey
      }
      {
        name: 'NAME'
        value: openAiAssistantName
      }
      {
        name: 'MODEL'
        value: openAiModel
      }
    ]
    scriptContent: '''
      response=$(curl -s "$ENDPOINT/openai/assistants?api-version=2024-05-01-preview" \
      -H "api-key: $API_KEY" \
      -H "Content-Type: application/json" \
      -d '{
        "name": "'"$NAME"'",
        "model": "'"$MODEL"'"
      }')

      # Check if the response is empty
      if [ -z "$response" ]; then
          echo "Failed to get a response from the OpenAI API."
          exit 1
      fi

      assistant_id=$(echo "$response" | jq -r '.id')

      echo "Assistant ID: $assistant_id"
      assistant_output=$(jq -n -c --arg assistant_id "$assistant_id" '{assistant_id: $assistant_id}')
      
      echo "$assistant_output"
      echo "$assistant_output" > "$AZ_SCRIPTS_OUTPUT_PATH"
    '''
    retentionInterval: 'PT1H'
    cleanupPreference: 'OnSuccess'
  }
}

output assistantId string = deploymentScript.properties.outputs.assistant_id
