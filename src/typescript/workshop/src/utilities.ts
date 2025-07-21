import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { AIProjectClient } from "@azure/ai-projects";
import { TerminalColors as tc } from './terminalColors.js';

export class Utilities {
  get sharedFilesPath(): string {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    return path.resolve(__dirname, '../../../shared');
  }

  loadInstructions(instructionsFile: string): string {
    const filePath = path.join(this.sharedFilesPath, instructionsFile);
    return fs.readFileSync(filePath, 'utf8');
  }

  logMsgGreen(msg: string): void {
    console.log(`${tc.GREEN}${msg}${tc.RESET}`);
  }

  logMsgPurple(msg: string): void {
    console.log(`${tc.PURPLE}${msg}${tc.RESET}`);
  }

  logTokenBlue(msg: string): void {
    process.stdout.write(`${tc.BLUE}${msg}${tc.RESET}`);
  }

async getFile(
    client: AIProjectClient,
    fileId: string,
    attachmentName: string
  ): Promise<void> {
    this.logMsgGreen(`Getting file with ID: ${fileId}`);

    const attachmentPart = attachmentName.split(':').pop() || '';
    const fileName = path.basename(attachmentPart, path.extname(attachmentPart));
    let fileExtension = path.extname(attachmentPart);
    if (!fileExtension) fileExtension = '.png';
    
    const fullFileName = `${fileName}.${fileId}${fileExtension}`;
    const folderPath = path.join(this.sharedFilesPath, 'files');
    
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }
    
    const filePath = path.join(folderPath, fullFileName);
    
    try {
      const response = await client.agents.files.getContent(fileId);
      
      let fileContent: Buffer | string;
      
      if (response instanceof Uint8Array) {
        fileContent = Buffer.from(response);
      } else if (typeof response === 'string') {
        fileContent = response;
      } else if (response && typeof response === 'object' && response !== null) {
        const respAny = response as any;
        if ('body' in respAny && respAny.body instanceof Uint8Array) {
          fileContent = Buffer.from(respAny.body);
        } else if ('data' in respAny && respAny.data instanceof Uint8Array) {
          fileContent = Buffer.from(respAny.data);
        } else if ('body' in respAny && typeof respAny.body === 'string') {
          fileContent = respAny.body;
        } else if ('data' in respAny && typeof respAny.data === 'string') {
          fileContent = respAny.data;
        } else {
          const keys = Object.keys(respAny);
        
          let found = false;
          for (const key of keys) {
            const value = respAny[key];
            if (value instanceof Uint8Array) {
              fileContent = Buffer.from(value);
              found = true;
              break;
            } else if (typeof value === 'string' && value.length > 0) {
              fileContent = value;
              found = true;
              break;
            }
          }
          
          if (!found) {
            throw new Error(`Unexpected response format. Keys: ${keys.join(', ')}`);
          }
        }
      } else {
        throw new Error(`Unexpected response type: ${typeof response}`);
      }
      
      await fs.promises.writeFile(filePath, fileContent!);
      
      this.logMsgGreen(`File saved to ${filePath}`);
    } catch (error) {
      console.error(`Error downloading file ${fileId}:`, error);
      throw error;
    }
  }

  async downloadFile(client: AIProjectClient, fileId: string, subfolder: string = 'files'): Promise<void> {
    try {
      this.logMsgGreen(`Downloading file with ID: ${fileId}`);
      
      const filesDir = path.join(this.sharedFilesPath, subfolder);
      if (!fs.existsSync(filesDir)) {
        fs.mkdirSync(filesDir, { recursive: true });
      }
      
      let filename = `download.${fileId}.png`; 
      try {
        const fileInfo = await client.agents.files.get(fileId);
        if (fileInfo.filename) {
          filename = fileInfo.filename;
        }
      } catch (error) {
        this.logMsgPurple(`Could not get file info, using default filename`);
      }
      
      const filePath = path.join(filesDir, filename);
      
      const response = await client.agents.files.getContent(fileId);
      
      let fileContent: Buffer | string;
      
      if (response instanceof Uint8Array) {
        fileContent = Buffer.from(response);
      } else if (typeof response === 'string') {
        fileContent = response;
      } else if (response && typeof response === 'object') {
        const respAny = response as any;
        if ('body' in respAny && respAny.body instanceof Uint8Array) {
          fileContent = Buffer.from(respAny.body);
        } else if ('data' in respAny && respAny.data instanceof Uint8Array) {
          fileContent = Buffer.from(respAny.data);
        } else if ('body' in respAny && typeof respAny.body === 'string') {
          fileContent = respAny.body;
        } else if ('data' in respAny && typeof respAny.data === 'string') {
          fileContent = respAny.data;
        } else {
          const keys = Object.keys(response);

          let found = false;
          for (const key of keys) {
            const value = respAny[key];
            if (value instanceof Uint8Array) {
              fileContent = Buffer.from(value);
              found = true;
              break;
            } else if (typeof value === 'string' && value.length > 0) {
              fileContent = value;
              found = true;
              break;
            }
          }
          
          if (!found) {
            throw new Error(`Unexpected response format. Keys: ${keys.join(', ')}`);
          }
        }
      } else {
        throw new Error(`Unexpected response type: ${typeof response}`);
      }
      
      await fs.promises.writeFile(filePath, fileContent!);
      
      this.logMsgGreen(`File saved to: ${path.relative(process.cwd(), filePath)}`);
      
    } catch (error) {
      console.error(`Error downloading file ${fileId}:`, error);
      throw error;
    }
}

async downloadFileWithName(client: AIProjectClient, fileId: string, fileName: string, subfolder: string = 'files'): Promise<void> {
  try {
    this.logMsgGreen(`Downloading file with ID: ${fileId} as ${fileName}`);
    const filesDir = path.join(this.sharedFilesPath, subfolder);
    if (!fs.existsSync(filesDir)) {
      fs.mkdirSync(filesDir, { recursive: true });
    }
    const filePath = path.join(filesDir, fileName);
    const streamableMethod = client.agents.files.getContent(fileId);
    const response = await streamableMethod.asNodeStream();
    let fileContent: Buffer;
    if (response.body) {
      const chunks: Buffer[] = [];
      await new Promise<void>((resolve, reject) => {
        response.body!.on('data', (chunk: any) => {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        });
        response.body!.on('end', resolve);
        response.body!.on('error', reject);
      });
      fileContent = Buffer.concat(chunks);
    } else {
      const directResponse = await streamableMethod as any;
      if (directResponse instanceof Uint8Array) {
        fileContent = Buffer.from(directResponse);
      } else if (Buffer.isBuffer(directResponse)) {
        fileContent = directResponse;
      } else if (typeof directResponse === 'string') {
        fileContent = Buffer.from(directResponse, 'latin1');
      } else if (directResponse && typeof directResponse === 'object' && 'body' in directResponse) {
        const body = (directResponse as any).body;
        if (body instanceof Uint8Array) {
          fileContent = Buffer.from(body);
        } else if (Buffer.isBuffer(body)) {
          fileContent = body;
        } else if (typeof body === 'string') {
          fileContent = Buffer.from(body, 'latin1');
        } else {
          throw new Error(`Unexpected response body type: ${typeof body}`);
        }
      } else {
        throw new Error(`Unexpected response type: ${typeof directResponse}`);
      }
    }
    await fs.promises.writeFile(filePath, fileContent);
    this.logMsgGreen(`File saved to: ${path.relative(process.cwd(), filePath)}`);
  } catch (error) {
    console.error(`Error downloading file ${fileId}:`, error);
    throw error;
  }
}

async uploadFile(
    client: AIProjectClient,
    filePath: string,
    purpose: string = 'assistants'
  ): Promise<any> {
    this.logMsgPurple(`Uploading file: ${filePath}`);
    
    try {
      // Create a readable stream from the file path
      const fileStream = fs.createReadStream(filePath);
      const fileName = path.basename(filePath);
      
      const file = await client.agents.files.upload(fileStream, purpose as any, {
        fileName: fileName
      });
      
      this.logMsgPurple(`File uploaded with ID: ${file.id}`);
      return file;
    } catch (error) {
      console.error(`Error uploading file ${filePath}:`, error);
      throw error;
    }
  }

async createVectorStore(
    client: AIProjectClient,
    files: string[],
    vectorStoreName: string
  ): Promise<any> {
    const fileIds: string[] = [];
    const prefix = this.sharedFilesPath;

    // Upload files
    for (const file of files) {
      const filePath = path.join(prefix, file);
      const fileInfo = await this.uploadFile(client, filePath, 'assistants');
      fileIds.push(fileInfo.id);
    }

    this.logMsgPurple("Creating the vector store");

    try {
      // Create vector store
      const vectorStore = await client.agents.vectorStores.create({
        name: vectorStoreName
      });

      this.logMsgPurple(`Created vector store with ID: ${vectorStore.id}`);

      // Add files to the vector store
      for (const fileId of fileIds) {
        const vectorStoreFile = await client.agents.vectorStoreFiles.create(vectorStore.id, {
          fileId: fileId,
        });
        this.logMsgPurple(`Added file ${fileId} to vector store: ${vectorStoreFile.id}`);
      }

      this.logMsgPurple("Vector store created and files added.");
      return vectorStore;
    } catch (error) {
      console.error("Error creating vector store:", error);
      throw error;
    }
  }
}