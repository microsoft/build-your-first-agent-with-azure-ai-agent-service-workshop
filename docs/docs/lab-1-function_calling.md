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

1. Open the `main.py` file in the `src/workshop` folder.
2. Uncomment the **# INSTRUCTIONS_FILE = "instructions/instructions_function_calling.txt"** line.
3. Uncomment the **# functions = AsyncFunctionTool(user_async_functions)"** line.
4. Uncomment the **# toolset.add(functions)** line.
5. Review the `instructions/instructions_function_calling.txt` file. This file contains the instructions for the LLM to call the `async_fetch_sales_data_using_sqlite_query` function in the `sales_data.py` file.
6. Review the `async_fetch_sales_data_using_sqlite_query` function in the `sales_data.py` file. This is the function that will be called by the LLM to execute dynamic SQL queries against the SQLite database.
7. Press <kbd>F5</kbd> to run the application.
8. In the terminal, you will see the application start and the LLM prompt you for a question. Ask a question about Contoso sales data, such as "What are the sales by region?".
9. The LLM calls the `async_fetch_sales_data_using_sqlite_query` function to execute a dynamic SQL query on the SQLite database. The retrieved data is returned to the LLM, formatted as `Markdown` according to the specifications in the instruction file, and returned to the user.
