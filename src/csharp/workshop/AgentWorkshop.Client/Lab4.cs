using Azure.AI.Agents.Persistent;
using Microsoft.Extensions.Configuration;

namespace AgentWorkshop.Client;

public class Lab4(PersistentAgentsClient client, string modelName, IConfigurationRoot config)
    : Lab(client, modelName)
{
    protected override string InstructionsFileName => "bing_grounding.txt";

    private PersistentAgentsVectorStore? vectorStore;

    public override IEnumerable<ToolDefinition> InitialiseLabTools()
    {
        BingGroundingSearchConfiguration searchConfig = new(
            config["Azure:BingConnectionId"] ?? throw new InvalidOperationException("The Bing Grounding connection is not configured. Ensure a correctly formatted connection ID is provided via the config setting 'Azure:BingConnectionId'.")
        );
        return [
            new FileSearchToolDefinition(),
            new BingGroundingToolDefinition(new BingGroundingSearchToolParameters([searchConfig]))
        ];
    }

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
