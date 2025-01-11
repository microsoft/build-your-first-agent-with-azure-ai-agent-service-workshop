# Solution Overview

The Contoso Sales Assistant is a conversational agent that can answer questions about sales data, generate charts, and create Excel files for further analysis.

The app is built with [Azure AI Agents Service](https://learn.microsoft.com/azure/ai-services/agents/){:target="_blank"} and uses the [Azure OpenAI gpt-4o](https://learn.microsoft.com/azure/ai-services/openai/concepts/models?tabs=global-standard%2Cstandard-chat-completions) LLM.

The app uses a read-only SQLite Contoso Sales Database with 40,000 rows of synthetic data. When the app starts, it reads the sales database schema, product categories, product types, and reporting years, then adds this data to the Azure AI Agent Service instruction context.

## Extending the Workshop Solution

The workshop solution is easily adaptable to various scenarios, such as customer support, by modifying the database and tailoring the Azure AI Agent Service instructions to suit the specific use case. The workshop solution is intentionally UX-agnostic, enabling you to focus on the core functionality of the AI Agent Service and apply the foundational concepts to build your own conversational agent.

### Best Practices Demonstrated in the App

- **Asynchronous APIs**:  
  The workshop sample uses asynchronous APIs for the Azure AI Agent Service and SQLite, optimizing resource utilization and enhancing scalability.

- **Token Streaming**:  
  Token streaming is incorporated to improve the user experience by reducing perceived response times in the LLM-powered app.

<!-- ## Solution structure

//TODO include a description of the VS Code project

//TODO Screenshots - File Explorer on the left and down in white -->
