import { 
  ThreadMessage,
  ThreadRun,
  MessageContent,
  MessageTextContent,
  MessageImageFileContent,
  isOutputOfType
} from '@azure/ai-agents';
import { AIProjectClient } from "@azure/ai-projects";
import { Utilities } from './utilities.js';

export class StreamEventHandler {
  private functionCallback: Function;
  private client: AIProjectClient;
  private util: Utilities;

  constructor(
    functionCallback: Function,
    client: AIProjectClient,
    utilities: Utilities
  ) {
    this.functionCallback = functionCallback;
    this.client = client;
    this.util = utilities;
  }

  async handleMessage(message: ThreadMessage): Promise<void> {
    // Handle message content and display it
    if (message.content && Array.isArray(message.content)) {
      for (const content of message.content) {
        if (isOutputOfType<MessageTextContent>(content, "text")) {
          this.util.logTokenBlue(content.text.value);
        } else if (isOutputOfType<MessageImageFileContent>(content, "image_file")) {
          console.log(`\nImage file: ${content.imageFile.fileId}`);
          // Download the image file
          await this.util.getFile(
            this.client, 
            content.imageFile.fileId, 
            `image_${content.imageFile.fileId}`
          );
        }
      }
    }
  }

  async handleRun(run: ThreadRun): Promise<void> {
    if (run.status === "failed") {
      console.log(`\nRun failed. Error: ${run.lastError?.message}`);
      console.log(`Thread ID: ${run.threadId}`);
      console.log(`Run ID: ${run.id}`);
    } else if (run.status === "completed") {
      console.log(`\nRun completed successfully.`);
    }
  }

  async handleError(error: any): Promise<void> {
    console.error(`\nAn error occurred: ${JSON.stringify(error)}`);
  }
}