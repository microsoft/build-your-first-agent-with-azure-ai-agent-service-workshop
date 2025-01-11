import os
from pathlib import Path

from azure.ai.projects.aio import AIProjectClient
from azure.ai.projects.models import MessageImageFileDetails, ThreadMessage, VectorStore


class Utilities:

    def log_msg_green(self, msg: str) -> None:
        print(f"\033[32m{msg}\033[0m")

    def log_msg_purple(self, msg:str) -> None:
        print(f"\033[35m{msg}\033[0m")

    def log_token_blue(self, msg:str) -> None:
        print(f"\033[34m{msg}\033[0m", end="", flush=True)

    async def get_file(self, project_client: AIProjectClient, file_id: str, attachment_name: str) -> None:
        """Retrieve the image file and save it to the local disk."""
        self.log_msg_green(f"Getting file with ID: {file_id}")

        file_name, file_extension = os.path.splitext(os.path.basename(attachment_name.split(":")[-1]))
        file_name = f"{file_name}.{file_id}{file_extension}"

        folder_path = Path("files")
        folder_path.mkdir(exist_ok=True)

        file_path = folder_path / f"{file_name}"

        # Save the file using a synchronous context manager
        with file_path.open("wb") as file:
            async for chunk in await project_client.agents.get_file_content(file_id):
                file.write(chunk)

        self.log_msg_green(f"Image file saved to {file_path}")
        # Cleanup the remote file
        await project_client.agents.delete_file(file_id)

    async def get_files(self, message: ThreadMessage, project_client: AIProjectClient) -> None:
        if message.image_contents:
            for index, image in enumerate(message.image_contents, start=0):
                attachment_name = message.file_path_annotations[index].text
                await self.get_file(project_client, image.image_file.file_id, attachment_name)
        elif message.attachments:
            for index, attachment in enumerate(message.attachments, start=0):
                attachment_name = message.file_path_annotations[index].text
                await self.get_file(project_client, attachment.file_id, attachment_name)


    async def upload_file(self, file_path: str) -> VectorStore:
        """ """
        pass

        # returns a vector_store

        # file = project_client.agents.upload_file_and_poll(file_path="../../datasheet/contoso-tents-datasheet.pdf", purpose="assistants")
        # print(f"Uploaded file, file ID: {file.id}")

        # vector_store = project_client.agents.create_vector_store_and_poll(file_ids=[file.id], name="my_vectorstore")
        # print(f"Created vector store, vector store ID: {vector_store.id}")
