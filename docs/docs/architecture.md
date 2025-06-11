# Solution Architecture

In this workshop, you will create the Contoso Sales Agent: a conversational agent designed to answer questions about sales data, generate charts, and download data files for further analysis.

## Components of the Agent App

1. **Microsoft Azure services**

    This agent is built on Microsoft Azure services.

      - **Generative AI model**: The underlying LLM powering this app is the [Azure OpenAI gpt-4o](https://learn.microsoft.com/azure/ai-services/openai/concepts/models?tabs=global-standard%2Cstandard-chat-completions#gpt-4o-and-gpt-4-turbo){:target="_blank"} LLM.

      - **Vector Store**: We will provide the agent with product information as a PDF file to support its queries. The agent will use the "basic agent setup" of the [Foundry Agent Service file search tool](https://learn.microsoft.com/azure/ai-services/agents/how-to/tools/file-search?tabs=python&pivots=overview){:target="_blank"} to find relevant portions of the document with vector search and provide them to the agent as context.

      - **Control Plane**: The app and its architectural components are managed and monitored using the [Azure AI Foundry](https://ai.azure.com){:target="_blank"} portal, accessible via the browser.

2. **Azure AI Foundry (SDK)**

    The workshop is offered in both [Python](https://learn.microsoft.com/python/api/overview/azure/ai-projects-readme?view=azure-python-preview&context=%2Fazure%2Fai-services%2Fagents%2Fcontext%2Fcontext){:target="_blank"} and [C#](https://learn.microsoft.com/en-us/dotnet/api/overview/azure/ai.projects-readme?view=azure-dotnet-preview&viewFallbackFrom=azure-python-preview){:target="_blank"} using the Azure AI Foundry SDK. The SDK supports key features of the Azure AI Agents service, including [Code Interpreter](https://learn.microsoft.com/azure/ai-services/agents/how-to/tools/code-interpreter?view=azure-python-preview&tabs=python&pivots=overview){:target="_blank"} and [Function Calling](https://learn.microsoft.com/azure/ai-services/agents/how-to/tools/function-calling?view=azure-python-preview&tabs=python&pivots=overview){:target="_blank"}.

3. **Database**

    The app is informed by the Contoso Sales Database, a [SQLite database](https://www.sqlite.org/){:target="_blank"} containing 40,000 rows of synthetic data. At startup, the agent app reads the sales database schema, product categories, product types, and reporting years, then incorporates this metadata into the Foundry Agent Service’s instruction context.

## Extending the Workshop Solution

The workshop solution is highly adaptable to various scenarios, such as customer support, by modifying the database and tailoring the Foundry Agent Service instructions to suit specific use cases. It is intentionally designed to be interface-agnostic, allowing you to focus on the core functionality of the AI Agent Service and apply the foundational concepts to build your own conversational agent.

## Best Practices Demonstrated in the App

The app also demonstrates some best practices for efficiency and user experience.

- **Asynchronous APIs**:
  In the workshop sample, both the Foundry Agent Service and SQLite use asynchronous APIs, optimizing resource efficiency and scalability. This design choice becomes especially advantageous when deploying the application with asynchronous web frameworks like FastAPI, ASP.NET, Chainlit, or Streamlit.

- **Token Streaming**:
  Token streaming is implemented to improve user experience by reducing perceived response times for the LLM-powered agent app.
