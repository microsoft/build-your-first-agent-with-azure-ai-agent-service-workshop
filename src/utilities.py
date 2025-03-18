import os
from pathlib import Path

from azure.ai.projects.aio import AIProjectClient
from azure.ai.projects.models import ThreadMessage

from terminal_colors import TerminalColors as tc


class Utilities:
    def log_msg_green(self, msg: str) -> None:
        """Print a message in green."""
        print(f"{tc.GREEN}{msg}{tc.RESET}")

    def log_msg_purple(self, msg: str) -> None:
        """Print a message in purple."""
        print(f"{tc.PURPLE}{msg}{tc.RESET}")

    def log_token_blue(self, msg: str) -> None:
        """Print a token in blue."""
        print(f"{tc.BLUE}{msg}{tc.RESET}", end="", flush=True)

    async def get_file(self, project_client: AIProjectClient, file_id: str, attachment_name: str) -> None:
        """Retrieve the file and save it to the local disk."""
        self.log_msg_green(f"Getting file with ID: {file_id}")

        file_name, file_extension = os.path.splitext(
            os.path.basename(attachment_name.split(":")[-1]))
        file_name = f"{file_name}.{file_id}{file_extension}"

        env = os.getenv("ENVIRONMENT", "local")
        folder_path = Path(f"{'src/' if env == 'container' else ''}files")

        folder_path.mkdir(parents=True, exist_ok=True)

        file_path = folder_path / file_name

        # Save the file using a synchronous context manager
        with file_path.open("wb") as file:
            async for chunk in await project_client.agents.get_file_content(file_id):
                file.write(chunk)

        self.log_msg_green(f"File saved to {file_path}")
        # Cleanup the remote file
        await project_client.agents.delete_file(file_id)
    
    async def get_file_path(self, project_client: AIProjectClient, file_id: str, attachment_name: str) -> str:
        """Retrieve the file and save it to the local disk."""
        self.log_msg_green(f"Getting file with ID: {file_id}")

        file_name, file_extension = os.path.splitext(
            os.path.basename(attachment_name.split(":")[-1]))
        file_name = f"{file_name}.{file_id}{file_extension}"

        env = os.getenv("ENVIRONMENT", "local")
        folder_path = Path(f"{'src/' if env == 'container' else ''}files")

        folder_path.mkdir(parents=True, exist_ok=True)

        file_path = folder_path / file_name

        # Save the file using a synchronous context manager
        with file_path.open("wb") as file:
            async for chunk in await project_client.agents.get_file_content(file_id):
                file.write(chunk)

        self.log_msg_green(f"File saved to {file_path}")
        # Cleanup the remote file
        await project_client.agents.delete_file(file_id)
        return str(file_path)

    async def get_files(self, message: ThreadMessage, project_client: AIProjectClient) -> None:
       for index, attachment in enumerate(message.attachments, start=0):
                attachment_name = (
                    "unknown" if not message.file_path_annotations else message.file_path_annotations[
                        index].text
                )
                await self.get_file(project_client, attachment.file_id, attachment_name)

    async def get_image_paths(self, message: ThreadMessage, project_client: AIProjectClient) -> list[str]:
        """Get file paths from the message attachments"""
        attachments = []
        for index, image in enumerate(message.image_contents, start=0):
                attachment_name = (
                    "unknown" if not message.file_path_annotations else message.file_path_annotations[
                        index].text
                )
                attachments.append(await self.get_file_path(project_client, image.image_file.file_id, attachment_name))

        return attachments
    
    async def get_file_paths(self, message: ThreadMessage, project_client: AIProjectClient) -> list[str]:
        """Get file paths from the message attachments"""
        attachments = []
        for index, attachment in enumerate(message.attachments, start=0):
                attachment_name = (
                    "unknown" if not message.file_path_annotations else message.file_path_annotations[
                        index].text
                )
                attachments.append(await self.get_file_path(project_client, attachment.file_id, attachment_name))

        return attachments

    async def create_vector_store(self, project_client: AIProjectClient, files: list[str], vector_name_name: str) -> None:
        """Upload a file to the project."""

        file_ids = []

        # Upload the files
        for file in files:
            file_path = Path(f"{file}")
            self.log_msg_purple(f"Uploading file: {file_path}")
            
            file_info = await project_client.agents.upload_file(file_path=file_path, purpose="assistants")
            file_ids.append(file_info.id)

        self.log_msg_purple("Creating the vector store")

        # Create a vector store
        vector_store = await project_client.agents.create_vector_store_and_poll(
            file_ids=file_ids, name=vector_name_name
        )

        self.log_msg_purple(
            f"Vector store created and files added.")
        return vector_store
