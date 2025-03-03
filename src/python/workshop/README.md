# Contoso Sales Analysis Agent

Imagine you are a sales manager at Contoso, a multinational retail company that sells outdoor equipment. You need to analyze sales data to find trends, understand customer preferences, and make informed business decisions. To help you, Contoso has developed a conversational agent that can answer questions about your sales data.

## What is an LLM-Powered AI Agent

An AI Agent is semi-autonomous software designed to achieve a given goal without requiring predefined steps or processes. Instead of following explicitly programmed instructions, the agent determines how to accomplish the task dynamically.

For example, if a user asks, "**Show the total sales by region as a pie chart**", the app does not rely on predefined logic for this specific request. Instead, a Large Language Model (LLM) interprets the request, manages the conversation flow and context, and orchestrates the necessary actions to produce the desired pie chart based on the regional sales data.

Unlike traditional applications, where developers define the logic and workflows to support business processes, AI Agents shift this responsibility to the LLM. In these systems, prompt engineering, clear instructions, and tool development are critical to ensuring the application performs as intended.

## What is the Azure AI Agent Service

The Azure AI Agent Service is a single-agent cloud service with accompanying SDKs. Developers can access SDKs for [Python](https://learn.microsoft.com/azure/ai-services/agents/quickstart?pivots=programming-language-python-azure) and [C#](https://learn.microsoft.com/azure/ai-services/agents/quickstart?pivots=programming-language-csharp).

The Azure AI Agent Service simplifies the creation of intelligent agents by offering built-in conversation state management and compatibility with various AI models. It provides a range of ready-to-use tools, including integrations with Fabric, SharePoint, Azure AI Search, and Azure Storage. The service also supports custom integrations through the Function Calling tool and enables RAG-style search capabilities with a built-in vector store for “file search” and semantic search features. Designed for scalability, it ensures smooth performance even under varying user loads.

Learn more about the Azure AI Agent Service in the [Azure AI Agent Service documentation](https://learn.microsoft.com/azure/ai-services/agents/concepts/agents){:target="_blank"}. In particular, read about the [components of agents](https://learn.microsoft.com/azure/ai-services/agents/concepts/agents#agents-components){:target="_blank"}.

## Workshop Dependencies

1. Python 3.12 or later
1. Visual Studio Code with the Python extension installed.
1. azd CLI installed.

## Workshop Requirements

1. **Azure Subscription**: If you don't have an Azure subscription, create a [free account](https://azure.microsoft.com/free/){:target="_blank"} before you begin.
1. To deploy the workshop resources, follow these instructions:

    ```shell
    tbc
    ```

1. Gather the following information from the output of the deployment as you'll need this information to update the .env file:

    - **PROJECT_CONNECTION_STRING**
    - **BING_CONNECTION_NAME**
    - **APP_INSIGHTS_INSTRUMENTATION_KEY**

## Workshop Setup

1. Open a terminal window.
2. From the terminal window, clone the workshop repo by running the following command:

    ```shell
    git clone https://github.com/gloveboxes/contoso-sales-ai-agent-service-workshop.git
    ```

3. Navigate to the workshop `src/workshop` folder for the repository you cloned in the previous step.

    ```shell
    cd contoso-sales-ai-agent-service-workshop/src/workshop
    ```

4. Create a virtual environment by running the following command:

    ```shell
    python -m venv .venv
    ```

5. Activate the virtual environment by running the following command:

    ```shell
    .\.venv\Scripts\activate
    ```

6. Install the required packages by running the following command:

    ```shell
    pip install -r requirements.txt
    ```

7. Open in VS Code. From the terminal window, run the following command:

    ```shell
    code .
    ```

## Configure the Environment

1. In VS Code, **create** a .env file in the **root** of the workshop folder.
1. **Update** the .env file with the following environment variables from the deployment output:

    ```text
    PROJECT_CONNECTION_STRING=<PROJECT_CONNECTION_STRING>
    BING_CONNECTION_NAME=<BING_CONNECTION_NAME>
    APP_INSIGHTS_INSTRUMENTATION_KEY=<APP_INSIGHTS_INSTRUMENTATION_KEY>
    ```

1. Save Changes
    - **Save** the changes to the .env file.


