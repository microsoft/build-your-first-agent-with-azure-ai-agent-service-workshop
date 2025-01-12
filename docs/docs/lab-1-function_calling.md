# Lab 1 The power of Function Calling

## Introduction

### What is Function Calling

Function Calling enables Large Language Models (LLMs) to interact with external systems, execute tasks, and integrate with APIs. The LLM determines when to invoke a function based on user prompts and returns **structured data** for application use. It’s then up to the developer to implement the function logic within the application. In this workshop solution, the function logic is used to execute dynamic SQL queries against the SQLite database.

### Enabling Function Calling

If you’re familiar with [Azure OpenAI Function Calling](https://learn.microsoft.com/azure/ai-services/openai/how-to/function-calling){:target="_blank"}, it requires defining a function schema for the LLM. Azure AI Agent Service supports this but also offers a more flexible option.

With the Azure AI Agent Service and its Python SDK, you can define the function definition directly in the Python function’s docstring. This keeps the definition and implementation together, simplifying maintenance and enhancing readability.

For example, in sales_data.py `async_fetch_sales_data_using_sqlite_query` function, the docstring specifies the function’s signature, inputs, and outputs. The SDK parses the docstring to define the callable function for the LLM.

``` python

async def async_fetch_sales_data_using_sqlite_query(self: "SalesData", sqlite_query: str) -> str:
    """
    This function is used to answer user questions about Contoso sales data by executing SQLite queries against the database.

    :param sqlite_query: The input should be a well-formed SQLite query to extract information based on the user's question. The query result will be returned as a JSON object.
    :return: Return data in JSON serializable format.
    :rtype: str
    """
```

### Dynamic SQL Generation

When the app starts, it incorporates the database schema and key data into the instructions for the Azure AI Agent Service. Using this input, the Large Language Model (LLM) generates SQLite-compatible SQL queries, which are executed to respond to user requests expressed in natural language.

## Lab 1 Exercise

In this lab, you will enable the function logic to execute dynamic SQL queries against the SQLite database. The function will be called by the LLM to answer user questions about Contoso sales data.

1. Open the `main.py`.
. **Uncomment** the following lines by removing the `#` character (Note, these lines are **not** consecutive):

    ```python
    # INSTRUCTIONS_FILE = "instructions/instructions_function_calling.txt"
    # toolset.add(functions)
    ```

3. Review the code in the `main.py` file. You code should look like the following:

    ``` python
    INSTRUCTIONS_FILE = "instructions/instructions_function_calling.txt"
    # INSTRUCTIONS_FILE = "instructions/instructions_code_interpreter.txt"
    # INSTRUCTIONS_FILE = "instructions/instructions_code_bing_grounding.txt"


    async def add_agent_tools():
        """Add tools for the agent."""
        toolset.add(functions)

        # code_interpreter = CodeInterpreterTool()
        # toolset.add(code_interpreter)

        # bing_connection = await project_client.connections.get(connection_name=BING_CONNECTION_NAME)
        # bing_grounding = BingGroundingTool(connection_id=bing_connection.id)
        # toolset.add(bing_grounding)
    ```

### Review the Instructions

Review the **instructions/instructions_function_calling.txt** file and refer to the **Tools** section for details on the function-calling instructions. Keep in mind that the **{database_schema_string}** placeholder is replaced with the actual database schema string when the application initializes.

### Review the Function Logic

Review the **async_fetch_sales_data_using_sqlite_query** function in the **sales_data**.py file.

Pay special attention to the **docstring**, the agent SDK will parse the docstring to generate the function definition that is passed to the LLM. The **async_fetch_sales_data_using_sqlite_query** function is called by the LLM to execute dynamically generated SQL queries against the SQLite database.

```python
async def async_fetch_sales_data_using_sqlite_query(self: "SalesData", sqlite_query: str) -> str:
        """
        This function is used to answer user questions about Contoso sales data by executing SQLite queries against the database.

        :param sqlite_query: The input should be a well-formed SQLite query to extract information based on the user's question. The query result will be returned as a JSON object.
        :return: Return data in JSON serializable format.
        :rtype: str
        """
```

### Run the Agent Application

1. Press <kbd>F5</kbd> to run the application.
2. In the terminal, you will see the application start and the agent app will prompt you to **Enter your query**.

### Start a Conversation with the Agent

Start asking questions about Contoso sales data. For example:

1. Help (or try asking help in your language)
      - The LLM will provide a list of starter questions.
2. **What are the sales by region?**
      - The LLM calls the `async_fetch_sales_data_using_sqlite_query` function to execute a dynamic SQL query on the SQLite database. The retrieved data is returned to the LLM, formatted as `Markdown` according to the specifications in the instruction file, and returned to the user.
      - Try setting a breakpoint in the `async_fetch_sales_data_using_sqlite_query` function to see the data being processed.
3. **What countries have the highest sales?**
4. **What were the sales of tents in the United States in April 2022?**
