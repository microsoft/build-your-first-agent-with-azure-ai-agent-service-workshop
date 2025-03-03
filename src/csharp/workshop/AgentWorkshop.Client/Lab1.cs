using Azure.AI.Projects;

namespace AgentWorkshop.Client;

public class Lab1(AIProjectClient client, string modelName)
    : Lab(client, modelName)
{
    protected override string InstructionsFileName => "instructions_function_calling.txt";
}
