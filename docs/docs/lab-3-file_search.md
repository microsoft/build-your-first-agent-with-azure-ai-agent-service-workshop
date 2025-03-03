## Introduction

Grounding a conversation with documents is highly effective, especially for retrieving product details that may not be available in an operational database. The Azure AI Agent Service includes a [File Search tool](https://learn.microsoft.com/en-us/azure/ai-services/agents/how-to/tools/file-search){:target="_blank"}, which enables agents to retrieve information directly from uploaded files, such as user-supplied documents or product data, enabling a [RAG-style](https://learn.microsoft.com/azure/ai-studio/concepts/retrieval-augmented-generation){:target="_blank"} search experience.

In this lab, you'll learn how to enable the document search and upload the Tents Data Sheet to a vector store for the agent. Once activated, the tool allows the agent to search the file and deliver relevant responses. Documents can be uploaded to the agent for all users or linked to a specific user thread, or linked to the Code Interpreter.

When the app starts, a vector store is created, the Contoso tents datasheet is added, and it is made available to the agent. Normally, you wouldn’t create a new vector store and upload documents each time the app starts. Instead, you’d create the vector store once, upload potentially thousands of documents, and connect the store to the agent. For this lab, we recreate the vector store on each startup to demonstrate the process.

A [vector store](https://en.wikipedia.org/wiki/Vector_database){:target="_blank"} is a database optimized for storing and searching vectors (numeric representations of text data). The File Search tool uses the vector store for [semantic search](https://en.wikipedia.org/wiki/Semantic_search){:target="_blank"} to search for relevant information in the uploaded document.

## Lab Exercise - Python

1. Open the **src/workshop/datasheet/contoso-tents-datasheet.pdf** file from VS Code.

2. **Review** the file’s contents to understand the information it contains, as this will be used to ground the agent’s responses.

    !!! info
        The PDF file includes detailed product descriptions for the tents sold by Contoso.

3. Open the file `main.py`.

4. **Uncomment** the following lines by removing the **"# "** characters

    ```python
    # INSTRUCTIONS_FILE = "instructions/instructions_file_search.txt"
    
    # vector_store = await utilities.create_vector_store(
    #     project_client,
    #     files=[TENTS_DATA_SHEET_FILE],
    #     vector_name_name="Contoso Product Information Vector Store",
    # )
    # file_search_tool = FileSearchTool(vector_store_ids=[vector_store.id])
    # toolset.add(file_search_tool)
    ```

    !!! warning
        The lines to be uncommented are not adjacent. When removing the # character, ensure you also delete the space that follows it.

5. Review the code in the `main.py` file.

    After uncommenting, your code should look like this:

    ``` python
    INSTRUCTIONS_FILE = "instructions/instructions_function_calling.txt"
    INSTRUCTIONS_FILE = "instructions/instructions_code_interpreter.txt"
    INSTRUCTIONS_FILE = "instructions/instructions_file_search.txt"
    # INSTRUCTIONS_FILE = "instructions/instructions_bing_grounding.txt"


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
        # bing_connection = await project_client.connections.get(connection_name=BING_CONNECTION_NAME)
        # bing_grounding = BingGroundingTool(connection_id=bing_connection.id)
        # toolset.add(bing_grounding)
    ```

## Lab Exercise - .NET

1. Open the **datasheet/contoso-tents-datasheet.pdf** file from VS Code.
1. **Review** the file’s contents to understand the information it contains, as this will be used to ground the agent’s responses.
1. Open the `Program.cs` file.
1. **Update** the creation of the lab to use the `Lab3` class.

    ```csharp
    await using Lab lab = new Lab3(projectClient, apiDeploymentName);
    ```

1. Review the `Lab3.cs` class to see how `InitialiseLabAsync` is used to add the PDF to a vector store and add the File Search tool to the agent, and `InitialiseToolResources` is used to add the File Search tool to the agent. These methods would be good places to add breakpoints to observe the process.

## Review the Instructions

The **instructions/instructions_file_search.txt** file provides guidance on how the LLM should use File Search for grounding purposes.

We have added a new tool to the instructions for the agent. This tool directs the agent to search the "Contoso Product Information Vector Store" for additional Contoso product information. This vector store is specified in a call to the `FileSearchTool` SDK function in `main.py`.

## Run the Agent App

1. Press <kbd>F5</kbd> and select whether you want to run the C# or Python app.
1. In the terminal, the app starts, and the agent app will prompt you to **Enter your query**.

### Start a Conversation with the Agent

The following conversation uses data from both the Contoso sales database and the uploaded Tents Data Sheet, so the results will vary depending on the query.

1. **What brands of hiking shoes do we sell?**

    !!! info
        We haven't provided the agent with any files containing information about hiking shoes.
        
        In the first lab you may have noticed that the transaction history from the underlying database did not include any product brands or descriptions, either. 

1. **What brands of tents do we sell?**

    The agent responds with a list of distinct tent brands mentioned in the Tents Data Sheet.

    !!! note
        The agent can now reference the provided data sheet to access details such as brand, description, product type, and category, and relate this data back to the Contoso sales database.

3. **What product type and categories are these brands associated with?**

    The agent provides a list of product types and categories associated with the tent brands.

4. **What were the sales of tents in 2024 by product type? Include the brands associated with each.**

It's possible the agent might get this wrong, and suggest incorrectly that AlpineGear has a Family Camping tent. To address this, you could provide further context in the instructions or the datasheet, or provide context to the agent directly as in next prompt.


4. **What were the sales of AlpineGear in 2024 by region?**

    The agent responds with sales data from the Contoso sales database.

    !!! note
        The agent interprets this as a request to find all sales of tents in the "CAMPING & HIKING' category, since it
        now has access to information that Alpine Gear is a brand of backpacking tent. 

5. **Contoso does not sell Family Camping tents from AlpineGear. Try again.**

    That's better!

## Stop the Agent App

When you're done, type **exit**, or press <kbd>Shift</kbd>+<kbd>F5</kbd> to stop the agent app.
