using Azure.AI.Projects;

namespace AgentWorkshop.Client;

public class Lab3(AIProjectClient client, string modelName) : Lab(client, modelName)
{
    protected override string InstructionsFileName => "instructions_file_search.txt";

    private VectorStore? vectorStore;

    public override IEnumerable<ToolDefinition> IntialiseLabTools() =>
        [new FileSearchToolDefinition()];

    protected override async Task InitialiseLabAsync(AgentsClient agentClient)
    {
        string datasheet = Path.Combine(SharedPath, "datasheet", "contoso-tents-datasheet.pdf");
        Utils.LogPurple($"Uploading file: {datasheet}");

        AgentFile file = await agentClient.UploadFileAsync(
            filePath: datasheet,
            purpose: AgentFilePurpose.Agents
        );

        Utils.LogPurple($"File uploaded: {file.Id}");

        vectorStore = await agentClient.CreateVectorStoreAsync(
            fileIds: [file.Id],
            name: "Contoso Product Information Vector Store"
        );

        Utils.LogPurple($"Vector store created: {vectorStore.Id}");
    }

    protected override ToolResources? InitialiseToolResources()
    {
        if (vectorStore is null)
        {
            throw new InvalidOperationException("Vector store must be created before initialising tool resources.");
        }

        return new ToolResources
        {
            FileSearch = new FileSearchToolResource([vectorStore.Id], null)
        };
    }
}
