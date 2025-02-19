# Solution Architecture

In this workshop, you will create the Contoso Sales Assistant: a conversational agent designed to answer questions about sales data, generate charts, and download data files for further analysis.

## Components of the agent

### Generative AI model
 The underlying Large Language Model (LLM) powering this app is the [Azure OpenAI gpt-4o](https://learn.microsoft.com/azure/ai-services/openai/concepts/models?tabs=global-standard%2Cstandard-chat-completions#gpt-4o-and-gpt-4-turbo){:target="_blank"} large language model (LLM). 


### Software Development Kit (SDK)

The app is built in Python using the [Azure AI Agents Service SDK](https://learn.microsoft.com/python/api/overview/azure/ai-projects-readme?view=azure-python-preview&context=%2Fazure%2Fai-services%2Fagents%2Fcontext%2Fcontext){:target="_blank"}. This SDK makes use of the [Code Interpreter](https://learn.microsoft.com/azure/ai-services/agents/how-to/tools/code-interpreter?view=azure-python-preview&tabs=python&pivots=overview) and [Function Calling](https://learn.microsoft.com/azure/ai-services/agents/how-to/tools/function-calling?view=azure-python-preview&tabs=python&pivots=overview) features of the Azure AI Agents service.


### Database

The app is informed by the Contoso Sales Database, a [SQLite database](https://www.sqlite.org/) containing 40,000 rows of synthetic data. Upon startup, the app reads the sales database schema, product categories, product types, and reporting years, then incorporates this data into the Azure AI Agent Service’s instruction context.

### Vector Store

We will provide the agent with product information as a PDF file to support its queries. The agent will use the "basic agent setup" of the [Azure AI Agent Service file search tool](https://learn.microsoft.com/azure/ai-services/agents/how-to/tools/file-search?tabs=python&pivots=overview) to find relevant portions of the document with vector search and provide them to the agent as context.

### Control Plane

The app and its architectural components are managed and monitored using the [Azure AI Foundry](https://ai.azure.com) portal, accessible via the browser.

## Extending the Workshop Solution

The workshop solution is highly adaptable to various scenarios, such as customer support, by modifying the database and tailoring the Azure AI Agent Service instructions to suit specific use cases. It is intentionally designed to be interface-agnostic, allowing you to focus on the core functionality of the AI Agent Service and apply the foundational concepts to build your own conversational agent.


## Best Practices Demonstrated in the App

- **Asynchronous APIs**:
  In the workshop sample, both the Azure AI Agent Service and SQLite use asynchronous APIs, optimizing resource efficiency and scalability. This design choice becomes especially advantageous when deploying the application with asynchronous web frameworks like FastAPI, Chainlit, or Streamlit.

- **Token Streaming**:
  Token streaming is implemented to improve user experience by reducing perceived response times for the LLM-powered agent app.

## Fork the Workshop Repository

Take a moment to fork the workshop repository to your GitHub account. This will make it easy to experiment with the code after you've completed the workshop.

1. Right-click [this link](https://aka.ms/aitour/wrk552/repo){:target="_blank"} and select Copy link.
2. Open a **new browser tab** on your **computer** (not in the Lab environment).
3. **Paste** the link into the browser's address bar and press **Enter**.
4. Click the **Fork** button in the upper right corner of the page.
5. You should see a new page with the title: **Create a new fork**.
6. Complete the requested details, then click the blue **Create fork** button.

You should now have a fork of this repository in your personal GitHub profile.