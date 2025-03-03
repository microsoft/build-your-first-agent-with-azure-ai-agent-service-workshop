using Azure;
using Azure.AI.Projects;
using System.ClientModel;
using System.Text.Json;

namespace AgentWorkshop.Client;

public abstract class Lab(AIProjectClient client, string modelName) : IAsyncDisposable
{
    protected static readonly string SharedPath = Path.Combine(Environment.CurrentDirectory, "..", "..", "..", "..", "..", "..", "shared");
    protected readonly SalesData SalesData = new(SharedPath);
    protected AIProjectClient Client { get; } = client;
    protected string ModelName { get; } = modelName;
    protected AgentsClient? agentClient;
    protected Agent? agent;
    protected AgentThread? thread;

    protected abstract string InstructionsFileName { get; }

    private readonly JsonSerializerOptions options = new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

    const int maxCompletionTokens = 4096;
    const int maxPromptTokens = 10240;
    const float temperature = 0.1f;
    const float topP = 0.1f;

    public virtual IEnumerable<ToolDefinition> IntialiseLabTools() => [];

    private IEnumerable<ToolDefinition> InitialiseTools() => [
        new FunctionToolDefinition(
            name: nameof(SalesData.FetchSalesDataAsync),
            description: "This function is used to answer user questions about Contoso sales data by executing SQLite queries against the database.",
            parameters: BinaryData.FromObjectAsJson(new {
                Type = "object",
                Properties = new {
                    Query = new {
                        Type = "string",
                        Description = "The input should be a well-formed SQLite query to extract information based on the user's question. The query result will be returned as a JSON object."
                    }
                },
                Required = new [] { "query" }
            },
            new JsonSerializerOptions() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase })
        ),
        ..IntialiseLabTools()
    ];

    public async Task RunAsync()
    {
        await Console.Out.WriteLineAsync("Creating agent...");
        agentClient = Client.GetAgentsClient();

        await InitialiseLabAsync(agentClient);

        IEnumerable<ToolDefinition> tools = InitialiseTools();
        ToolResources? toolResources = InitialiseToolResources();

        string instructions = await CreateInstructionsAsync();

        agent = await agentClient.CreateAgentAsync(
            model: ModelName,
            name: "Constoso Sales AI Agent",
            instructions: instructions,
            tools: tools,
            temperature: temperature,
            toolResources: toolResources
        );

        await Console.Out.WriteLineAsync($"Agent created with ID: {agent.Id}");

        await Console.Out.WriteLineAsync("Creating thread...");
        thread = await agentClient.CreateThreadAsync();
        await Console.Out.WriteLineAsync($"Thread created with ID: {thread.Id}");

        while (true)
        {
            await Console.Out.WriteLineAsync();
            Utils.LogGreen("Enter your query (type 'exit' to quit):");
            string? prompt = await Console.In.ReadLineAsync();

            if (prompt is null)
            {
                continue;
            }

            if (prompt.Equals("exit", StringComparison.InvariantCultureIgnoreCase))
            {
                break;
            }

            _ = await agentClient.CreateMessageAsync(
                threadId: thread.Id,
                role: MessageRole.User,
                content: prompt
            );

            AsyncCollectionResult<StreamingUpdate> streamingUpdate = agentClient.CreateRunStreamingAsync(
                threadId: thread.Id,
                assistantId: agent.Id,
                maxCompletionTokens: maxCompletionTokens,
                maxPromptTokens: maxPromptTokens,
                temperature: temperature,
                topP: topP
            );

            await foreach (StreamingUpdate update in streamingUpdate)
            {
                await HandleStreamingUpdateAsync(update);
            }
        }
    }

    protected virtual ToolResources? InitialiseToolResources() => null;

    private async Task<string> CreateInstructionsAsync()
    {
        string instructionsFile = Path.Combine(SharedPath, "instructions", InstructionsFileName);

        if (!File.Exists(instructionsFile))
        {
            throw new FileNotFoundException("Instructions file not found.", instructionsFile);
        }

        string instructions = File.ReadAllText(instructionsFile);

        string databaseSchema = await SalesData.GetDatabaseInfoAsync();

        instructions = instructions.Replace("{database_schema_string}", databaseSchema);
        return instructions;
    }

    protected virtual Task InitialiseLabAsync(AgentsClient agentClient) => Task.CompletedTask;

    private async Task HandleStreamingUpdateAsync(StreamingUpdate update)
    {
        switch (update.UpdateKind)
        {
            case StreamingUpdateReason.RunRequiresAction:
                // The run requires an action from the application, such as a tool output submission.
                // This is where the application can handle the action.
                RequiredActionUpdate requiredActionUpdate = (RequiredActionUpdate)update;
                await HandleActionAsync(requiredActionUpdate);
                break;

            case StreamingUpdateReason.MessageUpdated:
                // The agent has a response to the user, potentially requiring some user input
                // or further action. This comes as a stream of message content updates.
                MessageContentUpdate messageContentUpdate = (MessageContentUpdate)update;
                await Console.Out.WriteAsync(messageContentUpdate.Text);
                break;

            case StreamingUpdateReason.MessageCompleted:
                MessageStatusUpdate messageStatusUpdate = (MessageStatusUpdate)update;
                ThreadMessage tm = messageStatusUpdate.Value;

                var contentItems = tm.ContentItems;

                foreach (MessageContent contentItem in contentItems)
                {
                    if (contentItem is MessageImageFileContent imageContent)
                    {
                        await DownloadImageFileContentAsync(imageContent);
                    }
                }
                break;

            case StreamingUpdateReason.RunCompleted:
                // The run is complete, so we can print a new line.
                await Console.Out.WriteLineAsync();
                break;

            case StreamingUpdateReason.RunFailed:
                // The run failed, so we can print the error message.
                RunUpdate runFailedUpdate = (RunUpdate)update;

                if (runFailedUpdate.Value.LastError.Code == "rate_limit_exceeded")
                {
                    await Console.Out.WriteLineAsync(runFailedUpdate.Value.LastError.Message);
                    break;
                }

                await Console.Out.WriteLineAsync($"Error: {runFailedUpdate.Value.LastError.Message} (code: {runFailedUpdate.Value.LastError.Code})");
                break;
        }
    }

    private async Task DownloadImageFileContentAsync(MessageImageFileContent imageContent)
    {
        if (agentClient is null)
        {
            return;
        }

        Utils.LogGreen($"Getting file with ID: {imageContent.FileId}");

        BinaryData fileContent = await agentClient.GetFileContentAsync(imageContent.FileId);
        string directory = Path.Combine(SharedPath, "files");
        if (!Directory.Exists(directory))
        {
            Directory.CreateDirectory(directory);
        }

        string filePath = Path.Combine(directory, imageContent.FileId + ".png");
        await File.WriteAllBytesAsync(filePath, fileContent.ToArray());

        Utils.LogGreen($"File save to {Path.GetFullPath(filePath)}");
    }

    protected virtual AsyncCollectionResult<StreamingUpdate> HandleLabAction(RequiredActionUpdate requiredActionUpdate) =>
        throw new NotImplementedException();

    private async Task HandleActionAsync(RequiredActionUpdate requiredActionUpdate)
    {
        if (agentClient is null)
        {
            return;
        }

        AsyncCollectionResult<StreamingUpdate> toolOutputUpdate;
        if (requiredActionUpdate.FunctionName != nameof(SalesData.FetchSalesDataAsync))
        {
            toolOutputUpdate = HandleLabAction(requiredActionUpdate);
        }
        else
        {
            FetchSalesDataArgs salesDataArgs = JsonSerializer.Deserialize<FetchSalesDataArgs>(requiredActionUpdate.FunctionArguments, options) ?? throw new InvalidOperationException("Failed to parse JSON object.");
            string result = await SalesData.FetchSalesDataAsync(salesDataArgs.Query);
            toolOutputUpdate = agentClient.SubmitToolOutputsToStreamAsync(
                requiredActionUpdate.Value,
                new List<ToolOutput>([new ToolOutput(requiredActionUpdate.ToolCallId, result)])
            );
        }

        await foreach (StreamingUpdate toolUpdate in toolOutputUpdate)
        {
            await HandleStreamingUpdateAsync(toolUpdate);
        }
    }

    public async ValueTask DisposeAsync()
    {
        if (agentClient is not null)
        {
            if (thread is not null)
            {
                await agentClient.DeleteThreadAsync(thread.Id);
            }

            if (agent is not null)
            {
                await agentClient.DeleteAgentAsync(agent.Id);
            }
        }

        SalesData.Dispose();
    }

    record FetchSalesDataArgs(string Query);
}