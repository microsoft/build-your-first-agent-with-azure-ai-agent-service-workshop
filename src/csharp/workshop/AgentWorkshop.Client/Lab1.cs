using Azure.AI.Agents.Persistent;

namespace AgentWorkshop.Client;

public class Lab1(PersistentAgentsClient client, string modelName)
    : Lab(client, modelName)
{
    protected override string InstructionsFileName => "function_calling.txt";
}
