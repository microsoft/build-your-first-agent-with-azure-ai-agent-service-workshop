using AgentWorkshop.Client;
using Azure.AI.Agents.Persistent;
using Azure.Identity;
using Microsoft.Extensions.Configuration;

var builder = new ConfigurationBuilder()
    .AddUserSecrets<Program>();

var configuration = builder.Build();

string apiDeploymentName = configuration["Azure:ModelName"] ?? throw new InvalidOperationException("Azure:ModelName is not set in the configuration.");
string endpoint = configuration.GetConnectionString("AiAgentService") ?? throw new InvalidOperationException("AiAgentService is not set in the configuration.");

PersistentAgentsClient projectClient = new(endpoint, new DefaultAzureCredential());

// await using Lab lab = new Lab1(projectClient, apiDeploymentName);
// await lab.RunAsync();
