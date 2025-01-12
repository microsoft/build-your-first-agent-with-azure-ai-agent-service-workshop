# Lab 4 Grounding with Bing

## Introduction

Ground conversations with Bing is one of several tools provided with the Azure AI Agent Service. Grounding with Bing allows your application to search for information that is relevant to the conversation. For example, you might want to search for competitive product information.  

## Lab 4 Exercise

In this lab, you will enable Bing Grounding to provide competitive sales analysis of Contoso products and categories.

1. Open the `main.py` file in the `src/workshop` folder.
2. **Comment** the `# INSTRUCTIONS_FILE = "instructions/instructions_code_interpreter.txt` line.
3. **Uncomment** the `# INSTRUCTIONS_FILE = "instructions/instructions_code_bing_grounding.txt"` line.
4. **Uncomment** the `# bing_connection = project_client.connections.get(connection_name=BING_CONNECTION_NAME)` line.
5. **Uncomment** the `# bing_grounding = BingGroundingTool(bing_connection)` line.
6. **Uncomment** the `# toolset.add(bing_grounding)` line.
7. Review the code in the `main.py` file. You code should look like the following:

    ``` python
    # INSTRUCTIONS_FILE = "instructions/instructions_function_calling.txt"
    # INSTRUCTIONS_FILE = "instructions/instructions_code_interpreter.txt"
    INSTRUCTIONS_FILE = "instructions/instructions_code_bing_grounding.txt"

    sales_data = SalesData()
    utilities = Utilities()

    user_async_functions: Set[Callable[..., Any]] = {
        sales_data.async_fetch_sales_data_using_sqlite_query,
    }

    project_client = AIProjectClient.from_connection_string(
        credential=DefaultAzureCredential(),
        conn_str=PROJECT_CONNECTION_STRING,
    )


    functions = AsyncFunctionTool(user_async_functions)
    code_interpreter = CodeInterpreterTool()
    bing_connection = project_client.connections.get(connection_name=BING_CONNECTION_NAME)
    bing_grounding = BingGroundingTool(bing_connection)

    toolset = AsyncToolSet()
    toolset.add(functions)
    toolset.add(code_interpreter)
    toolset.add(bing_grounding)
    ```

6. Review the `instructions/instructions_code_interpreter.txt` file. This file provides the LLM with instructions on how to utilize the Code Interpreter.
7. Press <kbd>F5</kbd> to run the application.
8. In the terminal, you will see the application start and the LLM prompt you for a question. Ask a question about Contoso sales data, such as "**Show sales by region as a pie chart**".
9. The LLM calls the `async_fetch_sales_data_using_sqlite_query` function to execute a dynamic SQL query on the SQLite database to return the relevant data from the database.
10. The LLM then writes the appropriate Python code to generate a pie chart based on the data retrieved from the database.
11. When the task completes, you'll find the generates pie chart image in the `src/workshop/files` folder.
12. Click on the image to view the pie chart in Visual Studio Code.

