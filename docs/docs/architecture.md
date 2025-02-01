# Solution Overview

The Contoso Sales Assistant is a conversational agent designed to answer questions about sales data, generate charts, and create Excel files for further analysis.

The app is built using the [Azure AI Agents Service](https://learn.microsoft.com/azure/ai-services/agents/){:target="_blank"} and leverages the [Azure OpenAI gpt-4o](https://learn.microsoft.com/azure/ai-services/openai/concepts/models?tabs=global-standard%2Cstandard-chat-completions){:target="_blank"} LLM.

It utilizes a read-only SQLite Contoso Sales Database containing 40,000 rows of synthetic data. Upon startup, the app reads the sales database schema, product categories, product types, and reporting years, then incorporates this data into the Azure AI Agent Service’s instruction context.

## Extending the Workshop Solution

The workshop solution is highly adaptable to various scenarios, such as customer support, by modifying the database and tailoring the Azure AI Agent Service instructions to suit specific use cases. It is intentionally designed to be UX-agnostic, allowing you to focus on the core functionality of the AI Agent Service and apply the foundational concepts to build your own conversational agent.

### Best Practices Demonstrated in the App

- **Asynchronous APIs**:
  In the workshop sample, both the Azure AI Agent Service and SQLite use asynchronous APIs, optimizing resource efficiency and scalability. This design choice becomes especially advantageous when deploying the application with asynchronous web frameworks like FastAPI, Chainlit, or Streamlit.

- **Token Streaming**:
  Token streaming is implemented to improve user experience by reducing perceived response times for the LLM-powered agent app.

<details>

<summary>REMOVE: Fork the Workshop Repository</summary>
## Fork the Workshop Repository

Take a moment to fork the workshop repository to your GitHub account. This will make it easy to experiment with the code after you've completed the workshop.

1. Right-click [this link](https://aka.ms/aitour/wrk552/repo){:target="_blank"} and select Copy link.
2. Open a **new browser tab** on your **computer** (not in the Lab environment).
3. **Paste** the link into the browser's address bar and press **Enter**.
4. Click the **Fork** button in the upper right corner of the page.

</details>
