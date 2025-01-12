# Lab 4 Grounding with Bing

## Introduction

Ground conversations with Bing is one of several tools provided with the Azure AI Agent Service. Grounding with Bing allows your application to search for information that is relevant to the conversation. For example, you might want to search for competitive product information.

## Lab 4 Exercise

In this lab, you will enable Bing Grounding to provide competitive sales analysis of Contoso products and categories.

1. Open the `main.py`.
2. **Uncomment** the following lines by removing the `#` character (Note, these lines are **not** consecutive):

    ```python
    # INSTRUCTIONS_FILE = "instructions/instructions_code_bing_grounding.txt"
    # bing_connection = project_client.connections.get(connection_name=BING_CONNECTION_NAME)
    # bing_grounding = BingGroundingTool(bing_connection)
    # toolset.add(bing_grounding)
    ```

3. Review the code in the `main.py` file. You code should look like the following:

    ``` python
    INSTRUCTIONS_FILE = "instructions/instructions_function_calling.txt"
    INSTRUCTIONS_FILE = "instructions/instructions_code_interpreter.txt"
    INSTRUCTIONS_FILE = "instructions/instructions_code_bing_grounding.txt"


    async def add_agent_tools():
        """Add tools for the agent."""
        toolset.add(functions)

        code_interpreter = CodeInterpreterTool()
        toolset.add(code_interpreter)

        bing_connection = await project_client.connections.get(connection_name=BING_CONNECTION_NAME)
        bing_grounding = BingGroundingTool(connection_id=bing_connection.id)
        toolset.add(bing_grounding)
    ```

### Review the Instructions

The **instructions/instructions_code_bing_grounding.txt** file provides guidance on how the LLM should use Bing search for grounding purposes, ensuring that queries are limited to those relevant to Contoso and maintaining a focus on contextually appropriate searches.

### Run the Agent Application

1. Press <kbd>F5</kbd> to run the application.
2. In the terminal, you will see the application start and the agent app will prompt you to **Enter your query**.

### Start a Conversation with the Agent

Note, as this conversation is grounded with Bing search the results will vary.

1. **What beginner tents do we sell?**
1. **What tents do our competitors sell?**
1. **At what price do our competitors sell beginner tents?**
1. **What tents do we sell that are similar price to our competitors?**
