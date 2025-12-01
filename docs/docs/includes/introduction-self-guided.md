## Self-Guided Learners

These instructions are for self-guided learners who do not have access to a pre-configured lab environment. Follow these steps to set up your environment and begin the workshop.

## Introduction

This workshop is designed to teach you about the Azure AI Agents Service and the associated SDK. It consists of multiple labs, each highlighting a specific feature of the Azure AI Agents Service. The labs are meant to be completed in order, as each one builds on the knowledge and work from the previous lab.

## Prerequisites

1. Access to an Azure subscription. If you don't have an Azure subscription, create a [free account](https://azure.microsoft.com/free/){:target="_blank"} before you begin.
1. You need a GitHub account. If you don’t have one, create it at [GitHub](https://github.com/join){:target="_blank"}.

## Select Workshop Programming Language

The workshop is available in both Python and C#. Use the language selector tabs to choose your preferred language. Note, don't switch languages mid-workshop.

**Select the tab for your preferred language:**

=== "Python"
    The default language for the workshop is set to **Python**.
=== "C#"
    The default language for the workshop is set to **C#**.

## Open the Workshop

The preferred way to run this workshop is using GitHub Codespaces. This option provides a pre-configured environment with all the tools and resources needed to complete the workshop. Alternatively, you can open the workshop locally using a Visual Studio Code Dev Container.

=== "GitHub Codespaces"

    Select **Open in GitHub Codespaces** to open the project in GitHub Codespaces.

    [![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/microsoft/build-your-first-agent-with-azure-ai-agent-service-workshop){:target="_blank"}

    !!! Warning "Building the Codespace will take several minutes. You can continue reading the instructions while it builds."

=== "VS Code Dev Container"

    !!! warning "Apple Silicon Users"
        The automated deployment script you’ll be running soon isn’t supported on Apple Silicon. Please run the deployment script from Codespaces or from macOS instead of the Dev Container.

    Alternatively, you can open the project locally using a Visual Studio Code Dev Container, which will open the project in your local VS Code development environment using the [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers){:target="_blank"}.

    1. Start Docker Desktop (install it if not already installed)
    2. Select **Dev Containers Open** to open the project in a VS Code Dev Container.

        [![Open in Dev Containers](https://img.shields.io/static/v1?style=for-the-badge&label=Dev%20Containers&message=Open&color=blue&logo=visualstudiocode)](https://vscode.dev/redirect?url=vscode://ms-vscode-remote.remote-containers/cloneInVolume?url=https://github.com/microsoft/build-your-first-agent-with-azure-ai-agent-service-workshop)

    !!! Warning "The process of building the Dev Container, which involves downloading and setting it up on your local system, will take several minutes. During this time, you can continue reading the instructions."

## Authenticate with Azure

You need to authenticate with Azure so the agent app can access the Azure AI Agents Service and models. Follow these steps:

1. Ensure the Codespace has been created.
1. In the Codespace, open a new terminal window by selecting **Terminal** > **New Terminal** from the **VS Code menu**.
1. Run the following command to authenticate with Azure:

    ```shell
    az login --use-device-code
    ```

    !!! note
        You'll be prompted to open a browser link and log in to your Azure account. Be sure to copy the authentication code first.

        1. A browser window will open automatically, select your account type and click **Next**.
        2. Sign in with your Azure subscription **Username** and **Password**.
        3. **Paste** the authentication code.
        4. Select **OK**, then **Done**.

    !!! warning
        If you have multiple Azure tenants, then you will need to select the appropriate tenant when authenticating.

        ```shell
        az login --use-device-code --tenant <tenant_id>
        ```

1. Next, select the appropriate subscription from the command line.
1. Leave the terminal window open for the next steps.

## Deploy the Azure Resources

The following resources will be created in the **rg-contoso-agent-workshop-nnnn** resource group in your Azure subscription.

- An **Azure AI Foundry hub** named **fdy-contoso-agent-nnnn**
- An **Azure AI Foundry project** named **prj-contoso-agent-nnnn**
- A **Serverless (pay-as-you-go) GPT-4o-mini model deployment** named **gpt-4o-mini**. See pricing details [here](https://azure.microsoft.com/pricing/details/cognitive-services/openai-service/){:target="_blank"}.

!!! warning "You will need 120K TPM quota availability for the gpt-4o-mini Global Standard SKU, not because the agent uses lots of tokens, but due to the frequency of calls made by the agent to the model. Review your quota availability in the [AI Foundry Management Center](https://ai.azure.com/managementCenter/quota){:target="_blank"}."

We have provided a bash script to automate the deployment of the resources required for the workshop.

The script `deploy.sh` deploys to the `westus` region by default; edit the file to change the region or resource names. To run the script, open the VS Code terminal and run the following command:

    ```bash
    cd infra
 
    # Make the script executable if you get "permission denied"
    # chmod 755 sets explicit permissions:
    chmod 755 deploy.sh

    # Then run the deploy script
    ./deploy.sh
    ```


### Workshop Configuration

=== "Python"

    The deploy script generates the **.env** file, which contains the project endpoint, model deployment name. 
    
    You'll see this file when you open the Python workspace in VS Code. Your **.env** file will look similar to this but with your project endpoint.

    ```python
    MODEL_DEPLOYMENT_NAME="gpt-4o-mini"
    PROJECT_ENDPOINT="<your_project_endpoint>"
    ```
=== "C#"

    The automated deployment script stores project variables securely by using the Secret Manager feature for [safe storage of app secrets in development in ASP.NET Core](https://learn.microsoft.com/aspnet/core/security/app-secrets){:target="_blank"}.

    You can view the secrets by running the following command after you have opened the C# workspace in VS Code:

    ```bash
    dotnet user-secrets list
    ```

## Selecting the Language Workspace

There are two workspaces in the workshop, one for Python and one for C#. The workspace contains the source code and all the files needed to complete the labs for each language. Choose the workspace that matches the language you want to work with.

=== "Python"

    1. In Visual Studio Code, go to **File** > **Open Workspace from File**.
    2. Replace the default path with the following:

        ```text
        /workspaces/build-your-first-agent-with-azure-ai-agent-service-workshop/.vscode/
        ```

    3. Choose the file named **python-workspace.code-workspace** to open the workspace.

    ## Project Structure

    Be sure to familiarize yourself with the key **folders** and **files** you’ll be working with throughout the workshop.

    ### The workshop folder

    - The **main.py** file: The entry point for the app, containing its main logic.
    - The **sales_data.py** file: The function logic to execute dynamic SQL queries against the SQLite database.
    - The **stream_event_handler.py** file: Contains the event handler logic for token streaming.

    ### The shared folder

    - The **files** folder: Contains the files created by the agent app.
    - The **fonts** folder: Contains the multilingual fonts used by Code Interpreter.
    - The **instructions** folder: Contains the instructions passed to the LLM.

    ![Lab folder structure](../media/project-structure-self-guided-python.png)

=== "C#"

    1. In Visual Studio Code, go to **File** > **Open Workspace from File**.
    2. Replace the default path with the following:

        ```text
        /workspaces/build-your-first-agent-with-azure-ai-agent-service-workshop/.vscode/
        ```

    3. Choose the file named **csharp-workspace.code-workspace** to open the workspace.

    ## Project Structure

    Be sure to familiarize yourself with the key **folders** and **files** you’ll be working with throughout the workshop.

    ### The workshop folder

    - The **Lab1.cs, Lab2.cs, Lab3.cs** files: The entry point for each lab, containing its agent logic.
    - The **Program.cs** file: The entry point for the app, containing its main logic.
    - The **SalesData.cs** file: The function logic to execute dynamic SQL queries against the SQLite database.

    ### The shared folder

    - The **files** folder: Contains the files created by the agent app.
    - The **fonts** folder: Contains the multilingual fonts used by Code Interpreter.
    - The **instructions** folder: Contains the instructions passed to the LLM.

    ![Lab folder structure](../media/project-structure-self-guided-csharp.png)
