# Developer environment

This document describes how to set up your development environment to run the Contoso Sales Assistant locally. You'll need to create Azure OpenAI resources and create a Chainlit Literal AI API key. When deploying the Contoso Sales Assistant most of these steps will be automated.

## Open the Contoso Sales Assistant project in VS Code

### Pre-requisites

1. You'll need Visual Studio Code and the Remote - Containers extension installed. You can install the Remote - Containers extension from the Visual Studio Code marketplace at [Remote - Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers).
2. Docker Desktop installed. You can download Docker Desktop from [Docker Desktop](https://www.docker.com/products/docker-desktop).

Follow these steps to open the Contoso Sales Assistant project in Visual Studio Code:

1. Clone the repository

    ```shell
    git clone https://github.com/gloveboxes/contoso-sales-azure-openai-assistant.git
    ```

1. Change directory to the project folder

    ```shell
    cd contoso-sales-azure-openai-assistant
    ```

1. Open the project in Visual Studio Code

    ```shell
    code .
    ```

1. You'll be prompted to open in a Dev Container. Select `Reopen in Container`, select, and VS Code will build the development container and open the project.

## Create a `.env` file

When you create the Azure OpenAI resource, you'll need to copy the `Endpoint` and `Key` values to the `.env` file. The `.env` file is used to store environment variables for the Contoso Sales Assistant.

1. Copy the .env.example file and rename it to .env. You can find this file in the src folder.
2. Open the .env file and fill in the required values. Here is a list of the required environment variables along with a description of each:

    | Variable | Description |
    | --- | --- |
    | `AZURE_OPENAI_ENDPOINT` | The Azure OpenAI endpoint |
    | `AZURE_OPENAI_API_KEY` | The Azure OpenAI key |
    | `AZURE_OPENAI_DEPLOYMENT` | gpt4o |
    | `AZURE_OPENAI_API_VERSION` | 2024-05-01-preview. This is at November 2024 |
    | `AZURE_OPENAI_ASSISTANT_ID` | The Azure OpenAI assistant ID |
    | `ASSISTANT_PASSWORD` | Set to something easy to remember. When deploying a complex password will be auto generated. |
    | `LITERAL_API_KEY` | The Literal AI API key. By default this project uses the Chainlit Literal AI API for conversation history. You can deploy your own [Custom Data Layer](https://docs.chainlit.io/data-persistence/custom). |

## Create Azure resources

### Create an Azure OpenAI resource

From your Azure subscription, create an [Azure OpenAI resource](https://learn.microsoft.com/azure/ai-services/openai/how-to/create-resource?pivots=web-portal) with the GPT-4o deployment version 2024-08-06 or better. Follow these steps to create the Azure OpenAI resource:

1. Go to the [Azure portal to create an OpenAI resource](https://portal.azure.com/?microsoft_azure_marketplace_ItemHideKey=microsoft_openai_tip#create/Microsoft.CognitiveServicesOpenAI) and sign in with your Azure account.
2. Follow the documentation to [create an Azure OpenAI resource](https://learn.microsoft.com/azure/ai-services/openai/how-to/create-resource?pivots=web-portal)
   1. You need to create an Azure OpenAI resource with the GPT-4o deployment version 2024-08-06 or better.
   2. You'll need to copy the `Endpoint` and `Key` values to the `.env` file you created in the previous step.
   3. When you create the gpt-4o model you'll be linked off to the Azure AI Studio portal to create the model deployment.
   4. Create the model, then you'll need to **Edit** the model deployment to set the version to 2024-08-06 or better, and select approximately 60K tokens per minute.
   5. Keep the Azure AI Studio portal open as you'll need to create an assistant in the next step.

### Create an Azure OpenAI assistant

1. From the Azure AI Studio portal, select **Assistants** from the left-hand menu.
2. Select **Create assistant**.
3. Copy the `Assistant ID` to the `.env` file you created in the previous step. The assistant ID is used to interact with the Azure OpenAI assistant and will look something like this: `id:asst_3hOfhqSLjbbKwqPvNtmJ3gYz`.

For more information, see [Quickstart: Get started using Azure OpenAI Assistants](https://learn.microsoft.com/azure/ai-services/openai/assistants-quickstart?tabs=command-line%2Ctypescript-keyless&pivots=programming-language-ai-studio).

### Create a Chainlit Literal AI API key

1. Go to [Literal AI](https://cloud.getliteral.ai/)
2. Create a project and go to Settings to get your API key.
3. Copy the API key to the `.env` file you created in the previous step.
