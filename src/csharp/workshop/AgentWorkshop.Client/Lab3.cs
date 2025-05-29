using Azure.AI.Agents.Persistent;

namespace AgentWorkshop.Client;

public class Lab3(PersistentAgentsClient client, string modelName) : Lab(client, modelName)
{
    protected override string InstructionsFileName => "code_interpreter.txt";

    public override IEnumerable<ToolDefinition> IntialiseLabTools() =>
        [new CodeInterpreterToolDefinition()];
}
