import * as dotenv from 'dotenv';
import { DefaultAzureCredential } from '@azure/identity';
import type {
  FunctionToolDefinition,
  MessageImageFileContent,
  MessageTextContent,
  RequiredToolCall,
  SubmitToolOutputsAction,
  ToolOutput,
  CodeInterpreterToolDefinition,
  UpdateCodeInterpreterToolResourceOptions,
  UpdateToolResourcesOptions,
  FileSearchToolDefinition,
  BingGroundingToolDefinition,
  ToolDefinition
} from "@azure/ai-agents";

import {
  isOutputOfType,
  ToolUtility,
} from "@azure/ai-agents";

import { AIProjectClient } from "@azure/ai-projects";

import * as readline from 'readline-sync';
import { Utilities } from './utilities.js';
import { SalesData, fetchSalesDataUsingQuery } from './salesData.js';
import { TerminalColors as tc } from './terminalColors.js';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

// Configuration constants
const AGENT_NAME = "Contoso Sales Agent";
const TENTS_DATA_SHEET_FILE = "datasheet/contoso-tents-datasheet.pdf";
const FONTS_ZIP = "../../shared/fonts/fonts.zip";
const API_DEPLOYMENT_NAME = process.env.MODEL_DEPLOYMENT_NAME;
const PROJECT_ENDPOINT = process.env.PROJECT_ENDPOINT;
const CONNECTION_STRING = process.env.CONNECTION_STRING;
const AZURE_BING_CONNECTION_ID = process.env.AZURE_BING_CONNECTION_ID;
const MAX_COMPLETION_TOKENS = 10240;
const MAX_PROMPT_TOKENS = 20480;
const TEMPERATURE = 0.1;
const TOP_P = 0.1;

let INSTRUCTIONS_FILE: string;

// Lab configuration - uncomment lines as you progress through labs
INSTRUCTIONS_FILE = "instructions/function_calling.txt";
INSTRUCTIONS_FILE = "instructions/file_search.txt";
INSTRUCTIONS_FILE = "instructions/code_interpreter.txt";
INSTRUCTIONS_FILE = "instructions/bing_grounding.txt";
INSTRUCTIONS_FILE = "instructions/code_interpreter_multilingual.txt";

// Initialize clients and utilities
const utilities = new Utilities();
const salesData = new SalesData(utilities);

class FunctionToolExecutor {
    private functionTools: { func: Function; definition: FunctionToolDefinition }[];

    constructor(){
        this.functionTools = [
            {
                func: this.fetchSalesDataUsingQuery,
                ...ToolUtility.createFunctionTool({
                    name: "fetchSalesDataUsingQuery",
                    description: "This function is used to answer user questions about Contoso sales data by executing SQLite queries against the database.",
                    parameters: {
                        type: "object",
                        properties: {
                            query: {
                                type: "string",
                                description: "The input should be a well-formed SQLite query to extract information based on the user's question. The query result will be returned as a JSON object."
                            }
                        },
                        required: ["query"]
                    }
                })
            }
        ]
    }

    private async fetchSalesDataUsingQuery(params: any): Promise<any> {
        console.log(`\n${tc.BLUE}Function Call Tools: fetchSalesDataUsingQuery${tc.RESET}\n`);
        
        // Check if params exists and has a query property
        if (!params || typeof params.query === 'undefined') {
            console.error(`Invalid parameters received:`, JSON.stringify(params));
            return { error: "No query parameter provided" };
        }
        
        console.log(`${tc.BLUE}Executing query: ${params.query}${tc.RESET}\n`);
        return await fetchSalesDataUsingQuery(params);
    }

    public async invokeTool(toolCall: RequiredToolCall & FunctionToolDefinition): Promise<ToolOutput | undefined> {
        console.log(`Function tool call - ${toolCall.function.name}`);
        
        let params = {};
        
        // Check for arguments first (Azure AI Agents format), then fallback to parameters
        const rawParams = (toolCall.function as any).arguments || toolCall.function.parameters;
        
        if (rawParams) {
            try {
                if (typeof rawParams === 'string') {
                    params = JSON.parse(rawParams);
                } else if (typeof rawParams === 'object' && rawParams !== null) {
                    params = rawParams;
                } else {
                    params = {};
                }
            } catch (error) {
                console.error(`Failed to parse parameters: ${rawParams}`, error);
                return {
                    toolCallId: toolCall.id,
                    output: JSON.stringify({ error: `Failed to parse parameters: ${error}` }),
                };
            }
        }
        
        const functionMap = new Map(
            this.functionTools.map((tool) => [tool.definition.function.name, tool.func.bind(this)]),
        );

        const functionToCall = functionMap.get(toolCall.function.name);
        if (!functionToCall) {
            console.error(`Function ${toolCall.function.name} not found`);
            return {
                toolCallId: toolCall.id,
                output: JSON.stringify({ error: `Function ${toolCall.function.name} not found` }),
            };
        }
        
        try {
            const result = await functionToCall.call(this, params);
            return {
                toolCallId: toolCall.id,
                output: typeof result === 'string' ? result : JSON.stringify(result),
            };
        } catch (error) {
            console.error(`Error executing function ${toolCall.function.name}:`, error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            return {
                toolCallId: toolCall.id,
                output: JSON.stringify({ error: `Error executing function: ${errorMessage}` }),
            };
        }
    }

    public getFunctionDefinitions(): FunctionToolDefinition[] {
      return this.functionTools.map((tool) => {
        return tool.definition;
      });
    }
}

async function main(): Promise<void> {

    if (!PROJECT_ENDPOINT) {
        throw new Error("PROJECT_ENDPOINT environment variable is not defined");
    }

    // Check if INSTRUCTIONS_FILE is defined
    if (typeof INSTRUCTIONS_FILE === 'undefined') {
        console.log(`${tc.BG_BRIGHT_RED}ERROR: INSTRUCTIONS_FILE is not defined.${tc.RESET}`);
        console.log(`${tc.YELLOW}Please uncomment one of the INSTRUCTIONS_FILE lines at the beginning of main.ts${tc.RESET}`);
        console.log(`${tc.YELLOW}For Lab 1, uncomment: INSTRUCTIONS_FILE = "instructions/function_calling.txt";${tc.RESET}`);
        return;
    }

    // Create an Azure AI Client
    const client = new AIProjectClient(
        PROJECT_ENDPOINT,
        new DefaultAzureCredential()
    );

    // Load and customize instructions
    let instructions = utilities.loadInstructions(INSTRUCTIONS_FILE);
    await salesData.connect();
    const databaseSchemaString = await salesData.getDatabaseInfo();
    instructions = instructions.replace("{database_schema_string}", databaseSchemaString);

    const tools: ToolDefinition[] = [];
    let functionToolExecutor: FunctionToolExecutor | null = null;

    // Add tools based on lab configuration
    async function addAgentTools(): Promise<void> {
    // Add the functions tool
    functionToolExecutor = new FunctionToolExecutor();
    tools.push(...functionToolExecutor.getFunctionDefinitions());

    // Add the tents data sheet to a new vector data store
    const vectorStore = await utilities.createVectorStore(
        client,
        [TENTS_DATA_SHEET_FILE],
        "Contoso Product Information Vector Store"
    );
    const fileSearchTool: FileSearchToolDefinition = {
        type: "file_search"
    };
    tools.push(fileSearchTool);

        // Add the code interpreter tool
        const codeInterpreterTool: CodeInterpreterToolDefinition = {
            type: "code_interpreter"
        };
        tools.push(codeInterpreterTool);

        // Add the Bing grounding tool
        if (AZURE_BING_CONNECTION_ID) {
            const bingGroundingTool: BingGroundingToolDefinition = {
                type: "bing_grounding",
                bingGrounding: {
                  searchConfigurations: [
                    { connectionId: AZURE_BING_CONNECTION_ID }
                  ]
                }
            };
            tools.push(bingGroundingTool);
        } else {
            console.log(`${tc.YELLOW}Warning: AZURE_BING_CONNECTION_ID is not set. Skipping Bing grounding tool.${tc.RESET}`);
        }
    }

    await addAgentTools();

    // Create agent
    console.log("Creating agent...");
    const agent = await client.agents.createAgent("gpt-4o", {
      name: AGENT_NAME,
      instructions,
      tools: tools.length > 0 ? tools : undefined
    }); 
    console.log(`Created agent, ID: ${agent.id}`);

    // Add multilingual support to the code interpreter
    const fontFileInfo = await utilities.uploadFile(client, FONTS_ZIP);
    const codeInterpreterToolMultilingual: UpdateCodeInterpreterToolResourceOptions = {
        fileIds: [fontFileInfo.id]
    };
    const updateOptions: UpdateToolResourcesOptions = {
        codeInterpreter: codeInterpreterToolMultilingual
    };
    await client.agents.updateAgent(agent.id, {
        toolResources: updateOptions
    });
    console.log("Updated agent with multilingual support.");

    // Create a thread for the agent
    console.log("Creating thread...");
    const thread = await client.agents.threads.create();
    console.log(`Created Thread, thread ID:  ${thread.id}`);

    if (!agent || !thread) {
      console.log(`${tc.BG_BRIGHT_RED}Initialization failed.${tc.RESET}`);
      console.log("Exiting...");
      return;
    }

    let cmd: string | null = null;

    while (true) {
      const prompt = readline.question(`\n\n${tc.GREEN}Enter your query (type exit or save to finish): ${tc.RESET}`).trim();
      if (!prompt) {
        continue;
      }

      cmd = prompt.toLowerCase();
      if (cmd === "exit" || cmd === "save") {
        break;
      }

      await postMessage(client, thread.id, prompt, agent.id, functionToolExecutor);
    }

    if (cmd === "save") {
      console.log("The agent has not been deleted, so you can continue experimenting with it in the Azure AI Foundry.");
      console.log(`Navigate to https://ai.azure.com, select your project, then playgrounds, agents playground, then select agent id: ${agent.id}`);
    } else {
      await client.agents.deleteAgent(agent.id);
      console.log("The agent resources have been cleaned up.");
    }
}

console.log("Starting the program...");
main()
  .then(() => console.log("Program finished."))
  .catch(err => console.error("An error occurred:", err));

async function postMessage(
  client: AIProjectClient, 
  threadId: string, 
  content: string, 
  agentId: string,
  functionToolExecutor: FunctionToolExecutor | null
): Promise<void> {
  try {
    // Create message in the existing thread with the actual user content
    const message = await client.agents.messages.create(threadId, "user", content);
    console.log(`Created message, message ID ${message.id}`);

    // Create and manually poll a run in the existing thread
    console.log("Creating run...");
    let run = await client.agents.runs.create(threadId, agentId);
    console.log(`Created run, run ID: ${run.id}`);

    // Poll the run until completion
    while (run.status === "queued" || run.status === "in_progress" || run.status === "requires_action") {
      // Handle function calling
      if (run.status === "requires_action" && run.requiredAction && functionToolExecutor) {
        console.log("Run requires action");

        if (isOutputOfType<SubmitToolOutputsAction>(run.requiredAction, "submit_tool_outputs")) {
          const submitToolOutputsActionOutput = run.requiredAction;
          const toolCalls = submitToolOutputsActionOutput.submitToolOutputs.toolCalls;
          const toolResponses: ToolOutput[] = [];

          for (const toolCall of toolCalls) {
            if (isOutputOfType<FunctionToolDefinition>(toolCall, "function")) {
                const toolResponse = await functionToolExecutor.invokeTool(toolCall as RequiredToolCall & FunctionToolDefinition);
                if (toolResponse) {
                    toolResponses.push(toolResponse);
                }
            }
          }
          
          if (toolResponses.length > 0) {
            try {
              await client.agents.runs.submitToolOutputs(threadId, run.id, toolResponses);
              console.log(`Submitted tool responses successfully`);
            } catch (err) {
              console.error("Error submitting tool outputs:", err);
            }
          }
        }
      }

      // Wait before polling again
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Get updated run status
      run = await client.agents.runs.get(threadId, run.id);
      console.log(`Current Run status - ${run.status}, run ID: ${run.id}`);
    }
    
    console.log(`Run finished with status: ${run.status}`);

    // Display only the latest assistant message
    const messages = await client.agents.messages.list(threadId);
    const latestMessages = [];
    
    // Collect messages in array first
    for await (const threadMessage of messages) {
      latestMessages.push(threadMessage);
    }
    
    // Find the latest assistant message
    const latestAssistantMessage = latestMessages.find(msg => msg.role === "assistant");
    
    if (latestAssistantMessage) {
      console.log(`\n${tc.BLUE}Assistant Response:${tc.RESET}`);

    if (latestAssistantMessage) {
      console.log(`\n${tc.BLUE}Assistant Response:${tc.RESET}`);
      
      if (latestAssistantMessage.content && Array.isArray(latestAssistantMessage.content)) {
        for (let i = 0; i < latestAssistantMessage.content.length; i++) {
          const content = latestAssistantMessage.content[i];
          
          if (isOutputOfType<MessageTextContent>(content, "text")) {
            console.log(content.text.value);
            
            // Check for file path annotations within the text content
            if (content.text.annotations && content.text.annotations.length > 0) {
              for (const annotation of content.text.annotations) {
                if ('filePath' in annotation && annotation.filePath) {
                  console.log(`File annotation found: ${annotation.text}`);
                }
              }
            }
          } else if (isOutputOfType<MessageImageFileContent>(content, "image_file")) {
            console.log(`Image file: ${content.imageFile.fileId}`);
            
            // Generate a descriptive filename
            let fileName = `chart_${i}.${content.imageFile.fileId}.png`;
            
            // Try to extract a better name from preceding text content
            if (i > 0 && isOutputOfType<MessageTextContent>(latestAssistantMessage.content[i-1], "text")) {
              const textContent = latestAssistantMessage.content[i-1] as MessageTextContent;
              // Look for file references in the text
              const fileMatch = textContent.text.value.match(/(?:created|generated|saved).*?([a-zA-Z0-9_-]+\.png)/i);
              if (fileMatch) {
                fileName = `${fileMatch[1].replace('.png', '')}.${content.imageFile.fileId}.png`;
              }
            }
            
            // Download the file
            await utilities.downloadFileWithName(client, content.imageFile.fileId, fileName, 'files');
          }
        }
      }
    }
    }

  } catch (error) {
    console.error("An error occurred posting the message:", error);
  }
}