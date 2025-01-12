# Getting Started with the Workshop

This workshop is designed to help you get started with the Azure AI Agents Service and the Python SDK. The workshop is divided into multiple labs, each focusing on a specific feature of the Azure AI Agents Service. The labs are designed to be completed in sequence, with each lab building on the previous one.

## Lab Structure

Each lab in this workshop has an **introduction** that explains the relevant concepts, this is followed by an **exercise** that guides you through the process of implementing the feature.

## Understanding the Project Structure

When you open the workshop in Visual Studio Code, you will see the following folder structure. Make a note of the key folders and files that you will be working with during the workshop. The key folders and files are:

1. The **instructions** folder contains the instructions for each lab. Contains the instructions passed the LLM.
2. The **main.py** file is the entry point for the application. This file contains the main logic for the application.
3. The **sales_data.py** file contains the function logic to execute dynamic SQL queries against the SQLite database.
4. The **my_event_handler.py** file contains the event handler logic token streaming..

![Lab folder structure](./media/project_structure.png)

## AI Tour Workshop

If you’re participating in this workshop as part of the AI Tour, the environment has already been fully set up for you. Simply follow these instructions to open the workshop in Visual Studio Code.

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
    source .venv/bin/activate
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

1. Create a **.env** file in the **root** of the workshop folder.
2. Open the **.env** file on the desktop.
3. Copy the contents of the .env file on the desktop to the .env file in the root of the workshop folder.
4. Save the .env file.


<!-- 5. You'll be prompted to reopen the workshop in a **Dev Container**, select **Reopen in Container**. -->

<!-- You can skip this section and move to the next section. -->

<!-- ## Setting up the Environment

To complete this workshop, you need to set up your environment. This includes creating an Azure subscription, access to a GitHub account with Codespaces enabled, and an Azure AI Agents Service project.

Before you begin, ensure you have the following:

1. An Azure subscription. If you don't have an Azure subscription, create a [free account](https://azure.microsoft.com/free/) before you begin.
2. A GitHub account. If you don't have a GitHub account, create one at [GitHub]()
3. GitHub Codespaces enabled on your GitHub account.
4. Docker installed on your local machine. For more information, see [Install Docker Desktop on Windows](https://docs.docker.com/desktop/install/windows-install/) or [Install Docker Desktop on Mac](https://docs.docker.com/desktop/install/mac-install/). -->
