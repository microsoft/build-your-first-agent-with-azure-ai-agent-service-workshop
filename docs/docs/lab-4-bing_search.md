## Introduction

Grounding conversations with Bing is one of several tools provided by the Azure AI Agent Service. Grounding with Bing allows your app to search for information relevant to the conversation. For example, you might want to search for competitive product information.

## Lab Exercise

In this lab, you'll enable Bing Grounding to provide competitive sales analysis of Contoso products and categories.

### Grounding with Bing Search Service

You'll need to create a **Grounding with Bing Search Service** resource in the Azure portal and connect it to the Azure AI Foundry portal.

Follow these steps to create a Grounding with Bing Search Resource:

1. Make sure your app is still running. If it's not, open the `main.py` file and press <kbd>F5</kbd> to run the app.

1. In your browser, navigate to the [Azure AI Foundry](https://ai.azure.com) portal.

    !!! note
        Check that you are signed in and your project name "agent-workshop" appears in the top right.

2. In AI Foundry, click Agents in the left nav, and then select "Contoso Sales AI Agent"

    !!! note
        Information about your agent appears in the right pane. 

3. In the right pane next to "Knowledge (1)" click "+ Add". Then:

    - Click Grounding with Bing Search
    - Click "+ Create Connection"
    - Click "Create a new resource"

4. Now, fill in these fields in the Azure Portal window that appears:

    - Resource Group: Select the the resource group associated with your project from the drop-down list.(This can be found by clicking on your project name in the top right corner of AI Foundry.)
    - Name: Enter `grounding-with-bing-search`
    - Pricing Tier: Select the option "Grounding with Bing Search".
    - I confirm I have read and understood the notice above: Click the checkbox to accept Terms.

5. Click "Review + create", and then click Create.

For more information, visit the [Grounding with Bing Search](https://learn.microsoft.com/en-us/azure/ai-services/agents/how-to/tools/bing-grounding){:target="_blank"} documentation.

### Connect the Grounding with Bing Search resource

1. In your browser, return to the [Azure AI Foundry](https://ai.azure.com) portal.

2. In AI Foundry, click Agents in the left nav, and then select "Contoso Sales AI Agent"

3. In the right pane next to "Knowledge (1)" click "+ Add". Then:

    - Click Grounding with Bing Search
    - Click "+ Create Connection"

4. On the next screen, your `grounding-with-bing-search` resource will be shown.

     - Click "Add connection"
     - Click "Connect"

### Enable Grounding with Bing Search in the Agent App

1. Stop your running app: type **exit**, or press <kbd>Shift</kbd>+<kbd>F5</kbd> to stop the agent app

1. Open the file `main.py`.

1. **Uncomment** the following lines by removing the **"# "** characters

    ```python
    # INSTRUCTIONS_FILE = "instructions/instructions_bing_grounding.txt"
    
    # bing_connection = project_client.connections.get(connection_name=BING_CONNECTION_NAME)
    # bing_grounding = BingGroundingTool(bing_connection)
    # toolset.add(bing_grounding)
    ```

    !!! warning
        The lines to be uncommented are not adjacent. When removing the # character, ensure you also delete the space that follows it.

1. Review the code in the `main.py` file.

    After uncommenting, your code should look like this:

    ``` python
    INSTRUCTIONS_FILE = "instructions/instructions_function_calling.txt"
    INSTRUCTIONS_FILE = "instructions/instructions_code_interpreter.txt"
    INSTRUCTIONS_FILE = "instructions/instructions_file_search.txt"
    INSTRUCTIONS_FILE = "instructions/instructions_bing_grounding.txt"


    async def add_agent_tools():
        """Add tools for the agent."""

        # Add the functions tool
        toolset.add(functions)

        # Add the code interpreter tool
        code_interpreter = CodeInterpreterTool()
        toolset.add(code_interpreter)

        # Add the tents data sheet to a new vector data store
        vector_store = await utilities.create_vector_store(
            project_client,
            files=[TENTS_DATA_SHEET_FILE],
            vector_name_name="Contoso Product Information Vector Store",
        )
        file_search_tool = FileSearchTool(vector_store_ids=[vector_store.id])
        toolset.add(file_search_tool)

        # Add the Bing grounding tool
        bing_connection = await project_client.connections.get(connection_name=BING_CONNECTION_NAME)
        bing_grounding = BingGroundingTool(connection_id=bing_connection.id)
        toolset.add(bing_grounding)
    ```

### Review the Instructions

The **instructions/instructions_bing_grounding.txt** adds a new tool, "Competitive Insights for Products and Categories" that instructs the agent to use Bing Search to:

- Gather competitive product names, company names, and prices
- Never answer questions that are not related to outdoors camping and sports gear
- Make sure the search results are concise and directly relevant to the query

This ensures that queries remain relevant to Contoso and maintain a focus on contextually appropriate searches.

### Run the Agent App

This time, let's run our completed app in the Agents Playground within Azure AI Foundry:

1. In Azure AI Foundry, click "Agents" in the left hand nav
2. Select "Contoso Sales Agent"
3. In the right pane, click "Try in Playground".

You will see a chat window with a field at the bottom where you can enter your queries.

### Start a Conversation with the Agent

The agent combines data from the Contoso sales database, the Tents Data Sheet, and Bing Search to provide comprehensive responses, so the results will vary depending on the query.

1. **What beginner tents do we sell?**

    !!! info
        This information mainly comes from the file we provided in the vector information store. 

2. **What beginner tents do our competitors sell and include prices?**

    !!! info
        This information comes from the internet, and includes real-world product names and prices.

3. **Show as a bar chart**

    !!! info
        AI Agent Service is again using Code Interpreter to create the chart, but this time with
        real-world data sourced in the previous query. As before, look in `src/workshop/files` to view the chart.

4. **Show the tents we sell by region that are a similar price to our competitors beginner tents.**

    !!! info
        This query relies on the reasoning capabilities of the underlying large language model, along with the data returned by function calling. 

5. **Download the data**

    !!! info
        This query again relies on Code Interpreter to create the file from the context in the 
        previous queries.
    

