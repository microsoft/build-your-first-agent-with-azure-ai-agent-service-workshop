# Solution Overview

The Contoso Sales Assistant is a conversational agent designed to answer questions about sales data, generate charts, and create Excel files for further analysis.

The app is built using the [Azure AI Agents Service](https://learn.microsoft.com/azure/ai-services/agents/){:target="_blank"} and leverages the [Azure OpenAI gpt-4o](https://learn.microsoft.com/azure/ai-services/openai/concepts/models?tabs=global-standard%2Cstandard-chat-completions) LLM.

It utilizes a read-only SQLite Contoso Sales Database containing 40,000 rows of synthetic data. Upon startup, the app reads the sales database schema, product categories, product types, and reporting years, then incorporates this data into the Azure AI Agent Service’s instruction context.

## Extending the Workshop Solution

The workshop solution is highly adaptable to various scenarios, such as customer support, by modifying the database and tailoring the Azure AI Agent Service instructions to suit specific use cases. It is intentionally designed to be UX-agnostic, allowing you to focus on the core functionality of the AI Agent Service and apply the foundational concepts to build your own conversational agent.

### Best Practices Demonstrated in the App

- **Asynchronous APIs**:  
  The workshop sample employs asynchronous APIs for the Azure AI Agent Service and SQLite, optimizing resource utilization and enhancing scalability.

- **Token Streaming**:  
  Token streaming is implemented to improve user experience by reducing perceived response times in the LLM-powered app.

<!-- ## Solution structure

//TODO include a description of the VS Code project

//TODO Screenshots - File Explorer on the left and down in white -->
