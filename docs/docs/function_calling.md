# Lab 1 The power of Function Calling

## What is Function Calling

Function Calling allows Large Language Models (LLMs) to interact with external systems and execute tasks by invoking functions. This feature enables seamless integration with APIs, data retrieval, and action execution. The LLM determines when and how to call a function based on user prompts and returns structured data for easier processing and use in applications.

It’s important to understand that the developer is responsible for implementing the function logic within the application. By defining the function and its expected inputs, developers can create intelligent, task-oriented solutions that dynamically leverage the power of LLMs while maintaining control over the application’s behavior.

## Enabling Function Calling

If you’re familiar with OpenAI Function Calling, you know it requires defining a function schema that is passed to the LLM. While this approach is supported in the Azure AI Agent Service, the service offers a more flexible alternative for defining functions.

With the Azure AI Agent Service and its Python SDK, you can define the function schema directly in the docstring of the Python function called by the LLM. This approach allows you to keep the function definition and implementation in the same place, simplifying maintenance and improving code readability.

For example, in the sales_data.py file, you’ll see structured information in the docstring that specifies the function’s signature, expected inputs, and outputs. The Azure AI Agent Service SDK automatically inspects this docstring and uses the details to define the callable function for the LLM.

``` python

async def async_fetch_sales_data_using_sqlite_query(self: "SalesData", sqlite_query: str) -> str:
    """
    This function is used to answer user questions about Contoso sales data by executing SQLite queries against the database.

    :param sqlite_query: The input should be a well-formed SQLite query to extract information based on the user's question. The query result will be returned as a JSON object.
    :return: Return data in JSON serializable format.
    :rtype: str
    """

    print("\033[34mFunction Call Tools: async_fetch_sales_data_using_sqlite_query\033[0m")
    print(f"\033[34mExecuting query: {sqlite_query}\033[0m")

    try:
        # Perform the query asynchronously
        async with self.conn.execute(sqlite_query) as cursor:
            rows = await cursor.fetchall()
            columns = [description[0] for description in cursor.description]

        if not rows:  # No need to create DataFrame if there are no rows
            return json.dumps("The query returned no results. Try a different question.")
        data = pd.DataFrame(rows, columns=columns)
        return data.to_json(index=False, orient="split")

    except Exception as e:
        return json.dumps({"SQLite query failed with error": str(e), "query": sqlite_query})
```

### Understanding the Azure AI Agent Service Instructions

### Dynamic SQL Generation

<!-- - The LLM generates SQLite compatible SQL that is passed back from the LLM and executed by this app.
- The database schema and key data is added to the Azure AI Agent Service instructions with the app first runs.
- The LLM uses the database schema and key data to generate relevant SQL to be executed by the app
- When a user asks a natural language question about the data the LLM can use the provided data to generate appropriate SQL to return the data the user requested.
- See the 'async_fetch_sales_data_using_sqlite_query' function in the 'sales_data.py' file. -->

Upon initial run, the app integrates database schema and key data into Azure AI Agent Service instructions. The Large Language Model (LLM) generates SQLite-compatible SQL queries using this information. It executes these queries to respond to user requests framed in natural language about the data.

For more details, refer to the `async_fetch_sales_data_using_sqlite_query` function in the `sales_data.py` file.

### The power of the Docstring

Discuss Docstring annotations
