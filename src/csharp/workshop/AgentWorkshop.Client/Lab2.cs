using Azure.AI.Agents.Persistent;

namespace AgentWorkshop.Client;

public class Lab2(PersistentAgentsClient client, string modelName) : Lab(client, modelName)
{
    protected override string InstructionsFileName => "file_search.txt";

    private PersistentAgentsVectorStore? vectorStore;

    public override IEnumerable<ToolDefinition> IntialiseLabTools() =>
        [new FileSearchToolDefinition()];

    protected override async Task InitialiseLabAsync()
    {
        string datasheet = Path.Combine(SharedPath, "datasheet", "contoso-tents-datasheet.pdf");
        Utils.LogPurple($"Uploading file: {datasheet}");

        PersistentAgentFileInfo file = await Client.Files.UploadFileAsync(
            filePath: datasheet,
            purpose: PersistentAgentFilePurpose.Agents
        );

        Utils.LogPurple($"File uploaded: {file.Id}");

        vectorStore = await Client.VectorStores.CreateVectorStoreAsync(
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
