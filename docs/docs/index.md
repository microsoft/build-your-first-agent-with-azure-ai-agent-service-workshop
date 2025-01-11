# Contoso Sales Assistant

## Introduction to the Contoso Sales Assistant AI Agent

You are a sales manager at Contoso, a multinational retail company that sells outdoor equipment. You need to analyze sales data to find trends, understand customer preferences, and make informed business decisions. To help you, Contoso has developed a conversational AI Agent that can answer questions about your sales data.

![Contoso Sales Assistant](media/persona.png)

## What is an LLM-Powered AI Agent

An AI Agent is semi-autonomous software designed to achieve a given goal without requiring predefined steps or processes. Instead of following explicitly programmed instructions, the agent determines how to accomplish the task dynamically.

For example, if a user asks, “Show the total sales by region as a pie chart,” the app does not rely on prebuilt logic for this specific request. Instead, a Large Language Model (LLM) interprets the request, manages the conversation flow and context, and orchestrates the necessary actions to produce the desired pie chart based on the regional sales data.

Unlike traditional applications, where developers define the logic and workflows to support business processes, AI Agents shift this responsibility to the LLM. In these systems, prompt engineering, clear instructions, and maintaining context are critical to ensure the application performs as intended.

## What is the Azure AI Agent Service

The Azure AI Agent Service is a code-first single Agent developer experience and consists of a cloud service and SDKs. SDKs are available for [Python](https://learn.microsoft.com/azure/ai-services/agents/quickstart?pivots=programming-language-python-azure) and [C#](https://learn.microsoft.com/azure/ai-services/agents/quickstart?pivots=programming-language-csharp).

The Azure AI Agent Service simplifies the creation of intelligent agents by offering built-in conversation state management and compatibility with various AI models. It provides a range of ready-to-use tools, including integrations with Fabric, SharePoint, Azure AI Search, and Azure Storage. The service also supports custom integrations through the Function Calling tool and enables RAG-style search capabilities with a built-in vector store for “file search” and semantic search features. Designed for scalability, it ensures smooth performance even under varying user loads.

Learn more about the Azure AI Agent Service in the [Azure AI Agent Service documentation](https://learn.microsoft.com/azure/ai-services/agents/concepts/agents){:target="_blank"}. In particular, read about [Agents components](https://learn.microsoft.com/azure/ai-services/agents/concepts/agents#agents-components){:target="_blank"}.

## AI Agent Frameworks

Agent frameworks such as LangChain, Semantic Kernel, and CrewAI are popular. What sets the Azure AI Agent Service apart is its unique offering as a service with an accompanying SDK. For complex multi-agent scenarios, solutions will likely integrate SDKs like Semantic Kernel and AutoGen with the Azure AI Agent Service to build robust and scalable systems.
