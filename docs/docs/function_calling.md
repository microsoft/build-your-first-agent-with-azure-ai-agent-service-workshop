# Lab 1 The power of Function Calling

## What is Function Calling

Function Calling allows Large Language Models (LLMs) to interact with external systems and execute tasks by invoking functions. This feature enables seamless integration with APIs, data retrieval, and action execution. The LLM determines when and how to call a function based on user prompts and returns structured data for easier processing and use in applications.

It’s important to understand that the developer is responsible for implementing the function logic within the application. By defining the function and its expected inputs, developers can create intelligent, task-oriented solutions that dynamically leverage the power of LLMs while maintaining control over the application’s behavior.

## Enabling Function Calling

...

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
