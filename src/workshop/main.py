import asyncio
import logging
import os
from typing import Any, Callable, Set

from azure.ai.projects.aio import AIProjectClient
from azure.ai.projects.models import (
    AgentThread,
    AsyncFunctionTool,
    AsyncToolSet,
    BingGroundingTool,
    CodeInterpreterTool,
    FileSearchTool,
    Agent
)
from azure.identity import DefaultAzureCredential

from my_event_handler import MyEventHandler
from sales_data import SalesData
from utilities import Utilities

logging.basicConfig(level=logging.ERROR)
logger = logging.getLogger(__name__)

API_DEPLOYMENT_NAME = os.getenv("MODEL_DEPLOYMENT_NAME")
PROJECT_CONNECTION_STRING = os.environ["PROJECT_CONNECTION_STRING"]
BING_CONNECTION_NAME = os.getenv("BING_CONNECTION_NAME")
MAX_COMPLETION_TOKENS = 4096
MAX_PROMPT_TOKENS = 4096
TEMPERATURE = 0.2

# INSTRUCTIONS_FILE = "instructions/instructions_function_calling.txt"
INSTRUCTIONS_FILE = "instructions/instructions_code_interpreter.txt"
# INSTRUCTIONS_FILE = "instructions/instructions_file_search.txt"
# INSTRUCTIONS_FILE = "instructions/instructions_code_bing_grounding.txt"

sales_data = SalesData()
utilities = Utilities()
# agent = None
# thread = None

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

vector_store = utilities.upload_file("datasheet/contoso-tents-datasheet.pdf")
file_search_tool = FileSearchTool(vector_store_ids=[vector_store.id])

toolset = AsyncToolSet()
toolset.add(functions)
toolset.add(code_interpreter)
toolset.add(file_search_tool)
# toolset.add(bing_grounding)


async def initialize() -> tuple[Agent, AgentThread]:
    """Initialize the assistant with the sales data schema and instructions."""
    # global agent, thread

    await sales_data.connect()
    database_schema_string = await sales_data.get_database_info()

    try:
        with open(INSTRUCTIONS_FILE, "r") as file:
            instructions = file.read()

        instructions = instructions.replace("{database_schema_string}", database_schema_string)

        print("Creating agent...")
        agent = await project_client.agents.create_agent(
            model=API_DEPLOYMENT_NAME,
            name="Contoso Sales Assistant",
            instructions=instructions,
            toolset=toolset,
            temperature=0.2,
            headers={"x-ms-enable-preview": "true"},
        )
        print(f"Created agent, ID: {agent.id}")

        print("Creating thread...")
        thread = await project_client.agents.create_thread()
        print(f"Created thread, ID: {thread.id}")

        return agent, thread

    except Exception as e:
        logger.error("An error occurred initializing the assistant: %s", str(e))


async def cleanup(agent: Agent, thread: AgentThread) -> None:
    """Cleanup the resources."""
    await project_client.agents.delete_thread(thread.id)
    await project_client.agents.delete_agent(agent.id)
    await sales_data.close()


async def post_message(thread_id: str, content: str, thread: AgentThread) -> None:
    """Post a message to the Azure AI Agent Service."""
    await project_client.agents.create_message(
        thread_id=thread_id,
        role="user",
        content=content,
    )

    stream = await project_client.agents.create_stream(
        thread_id=thread.id,
        assistant_id=agent.id,
        event_handler=MyEventHandler(functions=functions, project_client=project_client, utilities=utilities),
        max_completion_tokens=MAX_COMPLETION_TOKENS,
        max_prompt_tokens=MAX_PROMPT_TOKENS,
        temperature=TEMPERATURE,
    )

    async with stream as s:
        await s.until_done()


async def main() -> None:
    """
    Main function to run the assistant.
    Example questions: Sales by region, top-selling products, total shipping costs by region, show as a pie chart.
    """
    agent, thread = await initialize()

    while True:
        prompt = input("\033[32mEnter your query: \033[0m")
        if prompt == "exit":
            break
        await post_message(thread_id=thread.id, content=prompt, thread=thread)

    await cleanup(agent, thread)


if __name__ == "__main__":
    print("Starting async program...")
    asyncio.run(main())
    print("Program finished.")
