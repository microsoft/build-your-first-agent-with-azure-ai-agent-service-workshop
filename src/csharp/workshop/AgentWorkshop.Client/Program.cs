using AgentWorkshop.Client;
using Azure.AI.Projects;
using Azure.Identity;
using Microsoft.Extensions.Configuration;

var builder = new ConfigurationBuilder()
    .AddUserSecrets<Program>();

var configuration = builder.Build();

string apiDeploymentName = configuration["Azure:ModelName"] ?? throw new InvalidOperationException("MODEL_DEPLOYMENT_NAME is not set in the configuration.");
string projectConnectionString = configuration.GetConnectionString("AiAgentService") ?? throw new InvalidOperationException("ConnectionStrings:AiAgentService is not set in the configuration.");

AIProjectClient projectClient = new(projectConnectionString, new DefaultAzureCredential());

// await using Lab lab = new Lab1(projectClient, apiDeploymentName);
// await lab.RunAsync();
