# Deployment

Deploying the Contoso Sales Assistant is a simple process using [azd](https://learn.microsoft.com/azure/developer/azure-developer-cli/).

## Open the project in Visual Studio Code

1. Open the project in a VS Code dev container as outlined in [Development](./development.md).
2. Open a terminal in VS Code by selecting `Terminal` > `New Terminal` from the top menu.
3. Create a Chainlit Auth Secret. This secret is used to authenticate with the Chainlit API. Run the following command:

    ```bash
    chainlit create-secret
    ```

    Copy the secret to the clipboard as you'll need it in the next step.

4. Authenticate with your Azure account with `az login --use-device-code`.
5. Run the following command to deploy the Contoso Sales Assistant to Azure:

    ```bash
    azd up
    ```

    You'll be prompted for the following information:

    1. Name the environment (e.g. `contoso sales assistant`).
    2. Select your subscription.
    3. Select the desired location. As at November 2024, the list of locations is limited to those location that support gpt-4o version 2024-08-06.
    4. Enter the **chainlitAuthSecret** you created above.
    5. Enter the **literalApiKey**. For information on how to create a Literal AI API key the [Developer](./developer.md#create-a-chainlit-literal-ai-api-key) notes.

    The deployment will take approximately 5 minutes to complete.

## Access the Contoso Sales Assistant

Once the deployment is complete, you'll need the app url and password to access the Contoso Sales Assistant.

1. From VS Code, navigate to the `.azure` folder in the project.
2. Expand the `contoso-sales-assistant` resource group and open the `.env` file.
3. Copy the `SERVICE_ACA_URI` and `assistantPassword` values to access the Contoso Sales Assistant.
4. Open a browser and navigate to the `SERVICE_ACA_URI` and append **/sales** to the URL.
5. You'll be prompted for email address and password. Enter the email address `sales@contoso.com` and the `assistantPassword` value you copied above.
6. You'll be redirected to the Contoso Sales Assistant. Now you can interact with the assistant to get sales information. Follow the [Conversation](./conversation.md) guide for sample questions you can ask.
