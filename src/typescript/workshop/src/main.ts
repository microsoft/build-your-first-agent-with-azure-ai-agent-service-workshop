// ─── Imports ───────────────────────────────────────────────
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as readline from 'readline-sync';
import { DefaultAzureCredential } from '@azure/identity';
import {
  ToolUtility,
  isOutputOfType,
} from "@azure/ai-agents";
import type {
  ToolDefinition,
  CodeInterpreterToolDefinition,
  BingGroundingToolDefinition,
  RequiredToolCall,
  ToolOutput,
  SubmitToolOutputsAction,
  FunctionToolDefinition,
  MessageTextContent,
  MessageImageFileContent
} from "@azure/ai-agents";
import { AIProjectClient } from "@azure/ai-projects";
import { Utilities } from './utilities.js';
import { SalesData, fetchSalesDataUsingQuery } from './salesData.js';
import { TerminalColors as tc } from './terminalColors.js';

// ─── Config & Constants ────────────────────────────────────
dotenv.config();
const AGENT_NAME = "Contoso Sales Agent";
const PROJECT_ENDPOINT = process.env.PROJECT_ENDPOINT;
const AZURE_BING_CONNECTION_ID = process.env.AZURE_BING_CONNECTION_ID;

if (!PROJECT_ENDPOINT) throw new Error("PROJECT_ENDPOINT is not defined");

const client = new AIProjectClient(PROJECT_ENDPOINT, new DefaultAzureCredential());
const utilities = new Utilities();
const salesData = new SalesData(utilities);

const TENTS_DATA_SHEET_FILE = "datasheet/contoso-tents-datasheet.pdf";
const FONTS_ZIP = "../../shared/fonts/fonts.zip";

// ─── Set the desired INSTRUCTIONS_FILE based on the lab you are working on ───

const INSTRUCTIONS_FILE = "instructions/function_calling.txt";
// const INSTRUCTIONS_FILE = "instructions/file_search.txt";
// const INSTRUCTIONS_FILE = "instructions/code_interpreter.txt";
// const INSTRUCTIONS_FILE = "instructions/bing_grounding.txt";
// const INSTRUCTIONS_FILE = "instructions/code_interpreter_multilingual.txt";

// ─── Tool Setup ─────────────────────────────────────────────
async function setupAgentTools(): Promise<{ tools: ToolDefinition[], toolResources: any, functionExecutor: FunctionToolExecutor }> {
  const tools: ToolDefinition[] = [];
  const functionExecutor = new FunctionToolExecutor();

  // ─── Uncomment the following line to enable FUNCTION CALLING ───
  // tools.push(...functionExecutor.getFunctionDefinitions());

  // ─── Uncomment the following lines to enable FILE SEARCH TOOL ───
  // const uploadedFile = await utilities.uploadFile(client, path.join(utilities.sharedFilesPath, TENTS_DATA_SHEET_FILE));
  // const vectorStoreId = await utilities.createVectorStore(client, [uploadedFile.id], "Contoso Product Information Vector Store");
  // const fileSearchTool = ToolUtility.createFileSearchTool([vectorStoreId]);
  // tools.push(fileSearchTool.definition);

  // ─── Uncomment the following line to enable CODE INTERPRETER ───
  // tools.push({ type: "code_interpreter" } as CodeInterpreterToolDefinition);

  // ─── Uncomment the following lines to enable BING GROUNDING TOOL ───
  // if (AZURE_BING_CONNECTION_ID) {
  //   tools.push({
  //     type: "bing_grounding",
  //     bingGrounding: {
  //       searchConfigurations: [{ connectionId: AZURE_BING_CONNECTION_ID }]
  //     }
  //   } as BingGroundingToolDefinition);
  // } else {
  // console.log(`${tc.YELLOW}Warning: AZURE_BING_CONNECTION_ID is not set.${tc.RESET}`);
  // }

  return { tools, toolResources: functionExecutor, functionExecutor };
}

// ─── Main Logic ─────────────────────────────────────────────
async function main(): Promise<void> {
  if (!INSTRUCTIONS_FILE) {
    console.error("Set INSTRUCTIONS_FILE");
    return;
  }

  let instructions = utilities.loadInstructions(INSTRUCTIONS_FILE);
  await salesData.connect();
  const schema = await salesData.getDatabaseInfo();
  instructions = instructions.replace("{database_schema_string}", schema);

  const { tools, toolResources, functionExecutor } = await setupAgentTools();

  console.log("Creating agent...");
  const agent = await client.agents.createAgent("gpt-4.1-mini", {
    name: AGENT_NAME,
    instructions,
    tools,
    toolResources,
  });
  console.log(`Created agent, ID: ${agent.id}`);

  // ─── Uncomment the following lines to add MULTILINGUAL SUPPORT to the CODE INTERPRETER ───
  // const fontFile = await utilities.uploadFile(client, FONTS_ZIP);
  // await client.agents.updateAgent(agent.id, {
  //   toolResources: { codeInterpreter: { fileIds: [fontFile.id] } }
  // });

  const thread = await client.agents.threads.create();
  console.log(`Thread created: ${thread.id}`);

  while (true) {
    const prompt = readline.question(`${tc.GREEN}Enter your query (type exit to finish): ${tc.RESET}`).trim();
    if (!prompt) continue;
    if (["exit", "save"].includes(prompt.toLowerCase())) break;

    await postMessage(client, thread.id, prompt, agent.id, functionExecutor);
  }

  console.log("Cleaning up...");
  await client.agents.deleteAgent(agent.id);
  console.log("Agent resources cleaned.");
}

main().catch(console.error);

// Helper class for function tools
class FunctionToolExecutor {
  private functionTools: { func: Function; definition: FunctionToolDefinition }[];

  constructor() {
    this.functionTools = [
      {
        func: this.fetchSalesDataUsingQuery,
        ...ToolUtility.createFunctionTool({
          name: "fetchSalesDataUsingQuery",
          description: "Answer user questions about Contoso sales data by executing SQLite queries against the database.",
          parameters: {
            type: "object",
            properties: {
              query: { type: "string", description: "A well-formed SQLite query to extract information based on the user's question." }
            },
            required: ["query"]
          }
        })
      }
    ];
  }

  private async fetchSalesDataUsingQuery(params: any): Promise<any> {
    console.log(`\n${tc.BLUE}Executing fetchSalesDataUsingQuery${tc.RESET}\n`);
    return await fetchSalesDataUsingQuery(params);
  }

  public async invokeTool(toolCall: RequiredToolCall & FunctionToolDefinition): Promise<ToolOutput | undefined> {
    let rawParams = (toolCall.function as any).arguments || (toolCall.function as any).parameters;
    let params: any = {};

    if (typeof rawParams === 'string') {
      params = JSON.parse(rawParams);
    } else if (typeof rawParams === 'object' && rawParams !== null) {
      params = rawParams;
    } else {
      throw new Error(`Could not parse parameters from tool call: ${JSON.stringify(toolCall.function)}`);
    }

        const func = this.functionTools.find(t => t.definition.function.name === toolCall.function.name)?.func;
        if (!func) {
          return { toolCallId: toolCall.id, output: `Function ${toolCall.function.name} not found.` };
        }
    const result = await func(params);
    return { toolCallId: toolCall.id, output: JSON.stringify(result) };
  }

  public getFunctionDefinitions(): FunctionToolDefinition[] {
    return this.functionTools.map(t => t.definition);
  }
}

// ─── Message Posting ────────────────────────────────────────
async function postMessage(
  client: AIProjectClient,
  threadId: string,
  content: string,
  agentId: string,
  functionExecutor: FunctionToolExecutor
) {
  const message = await client.agents.messages.create(threadId, "user", content);
  let run = await client.agents.runs.create(threadId, agentId);

  while (["queued", "in_progress", "requires_action"].includes(run.status)) {
    if (run.status === "requires_action" && run.requiredAction) {
      const action = run.requiredAction as SubmitToolOutputsAction;
      const responses: ToolOutput[] = [];

      for (const toolCall of action.submitToolOutputs.toolCalls) {
        if (isOutputOfType<FunctionToolDefinition>(toolCall, "function")) {
          const resp = await functionExecutor.invokeTool(toolCall as RequiredToolCall & FunctionToolDefinition);
          if (resp) responses.push(resp);
        }
      }

      if (responses.length) {
        await client.agents.runs.submitToolOutputs(threadId, run.id, responses);
      }
    }

    await new Promise(r => setTimeout(r, 2000));
    run = await client.agents.runs.get(threadId, run.id);
  }

  console.log(`Run finished: ${run.status}`);

  // Display only the latest assistant message
  const messages = await client.agents.messages.list(threadId);
  const latestMessages = [];
  for await (const threadMessage of messages) {
    latestMessages.push(threadMessage);
  }
  const latestAssistantMessage = latestMessages.find(msg => msg.role === "assistant");
  if (latestAssistantMessage) {
    console.log(`\n${tc.BLUE}Assistant Response:${tc.RESET}`);
    if (latestAssistantMessage.content && Array.isArray(latestAssistantMessage.content)) {
      for (let i = 0; i < latestAssistantMessage.content.length; i++) {
        const content = latestAssistantMessage.content[i];
        if (isOutputOfType<MessageTextContent>(content, "text")) {
          console.log(content.text.value);
          if (content.text.annotations && content.text.annotations.length > 0) {
            for (const annotation of content.text.annotations) {
              if ('filePath' in annotation && annotation.filePath) {
                console.log(`File annotation found: ${annotation.text}`);
              }
            }
          }
        } else if (isOutputOfType<MessageImageFileContent>(content, "image_file")) {
          console.log(`Image file: ${content.imageFile.fileId}`);
          let fileName = `chart_${i}.${content.imageFile.fileId}.png`;
          if (i > 0 && isOutputOfType<MessageTextContent>(latestAssistantMessage.content[i-1], "text")) {
            const textContent = latestAssistantMessage.content[i-1] as MessageTextContent;
            const fileMatch = textContent.text.value.match(/(?:created|generated|saved).*?([a-zA-Z0-9_-]+\.png)/i);
            if (fileMatch) {
              fileName = `${fileMatch[1].replace('.png', '')}.${content.imageFile.fileId}.png`;
            }
          }
          await utilities.downloadFileWithName(client, content.imageFile.fileId, fileName, 'files');
        }
      }
    }
  }
}
