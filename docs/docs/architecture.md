# Solution Overview

The Contoso Sales Assistant is a conversational agent that can answer questions about sales data, generate charts, and create Excel files for further analysis.

// TODO - get the URL for AI Agent URL

The app is built with [Azure OpenAI GPT-4o](https://learn.microsoft.com/azure/ai-services/openai/concepts/models){:target="_blank"} , the [Azure AI Agent Agent service](https://learn.microsoft.com/azure/ai-services/openai/concepts/assistants){:target="_blank"}.

The app uses a read-only SQLite Contoso Sales Database with 40,000 rows of synthetic data. When the app starts, it reads the sales database schema, product categories, product types, and reporting years, then adds this data to the Azure AI Agent Service instruction context.

The Azure AI Agent Service offers several "out-of-the-box" tools, including support for data within Fabric, SharePoint, and Azure Storage. It also allows the creation of custom integrations using the Function Calling tool and supports RAG-style search capabilities through a built-in "file search" vector store and semantic search functionality.

## Why use the Azure AI Agent Service?

## Overview of Best Practices in Conversational Agent Development

The app showcases best practices for creating a conversational agent:

- The workshop sample uses asynchronous APIs for the Azure AI Agent Service and SQLite, optimizing resource use and enhancing scalability.
- It incorporates token streaming to enhance user experience by improving perceived response times from the LLM-powered app.

## Solution structure

//TODO include a description of the VS Code project

//TODO Screenshots - File Explorer on the left and down in white
