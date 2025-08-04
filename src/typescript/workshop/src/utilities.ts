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

  private async parseResponse(response: any): Promise<Buffer> {
    if (response instanceof Uint8Array) return Buffer.from(response);
    if (Buffer.isBuffer(response)) return response;
    if (typeof response === 'string') return Buffer.from(response, 'latin1');

    const candidates = ['body', 'data'];
    for (const key of candidates) {
      if (response[key] instanceof Uint8Array) return Buffer.from(response[key]);
      if (typeof response[key] === 'string') return Buffer.from(response[key], 'latin1');
    }

    for (const [key, value] of Object.entries(response)) {
      if (value instanceof Uint8Array) return Buffer.from(value);
      if (typeof value === 'string' && value.length > 0) return Buffer.from(value, 'latin1');
    }

    throw new Error(`Unexpected response format. Keys: ${Object.keys(response).join(', ')}`);
  }

  private ensureFolderExists(folder: string): void {
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }
  }

  async saveFile(client: AIProjectClient, fileId: string, filePath: string): Promise<void> {
    const response = await client.agents.files.getContent(fileId);
    const fileContent = await this.parseResponse(response);
    await fs.promises.writeFile(filePath, fileContent);
    this.logMsgGreen(`File saved to: ${path.relative(process.cwd(), filePath)}`);
  }

  async downloadFile(client: AIProjectClient, fileId: string, subfolder = 'files'): Promise<void> {
    this.logMsgGreen(`Downloading file with ID: ${fileId}`);
    const filesDir = path.join(this.sharedFilesPath, subfolder);
    this.ensureFolderExists(filesDir);

    let filename = `download.${fileId}.png`;
    try {
      const fileInfo = await client.agents.files.get(fileId);
      if (fileInfo.filename) filename = fileInfo.filename;
    } catch {
      this.logMsgPurple(`Could not get file info, using default filename`);
    }

    const filePath = path.join(filesDir, filename);
    await this.saveFile(client, fileId, filePath);
  }

  async downloadFileWithName(
    client: AIProjectClient,
    fileId: string,
    fileName: string,
    subfolder = 'files'
  ): Promise<void> {
    this.logMsgGreen(`Downloading file with ID: ${fileId} as ${fileName}`);
    const filesDir = path.join(this.sharedFilesPath, subfolder);
    this.ensureFolderExists(filesDir);
    const filePath = path.join(filesDir, fileName);

    const streamableMethod = client.agents.files.getContent(fileId);
    const response = await streamableMethod.asNodeStream();

    if (response.body) {
      const chunks: Buffer[] = [];
      await new Promise<void>((resolve, reject) => {
        response.body!.on('data', (chunk: any) => chunks.push(Buffer.from(chunk)));
        response.body!.on('end', resolve);
        response.body!.on('error', reject);
      });
      await fs.promises.writeFile(filePath, Buffer.concat(chunks));
    } else {
      await this.saveFile(client, fileId, filePath);
    }

    this.logMsgGreen(`File saved to: ${path.relative(process.cwd(), filePath)}`);
  }

  async uploadFile(
    client: AIProjectClient,
    filePath: string,
    purpose = 'assistants'
  ): Promise<any> {
    this.logMsgPurple(`Uploading file: ${filePath}`);
    const fileStream = fs.createReadStream(filePath);
    const fileName = path.basename(filePath);
    const file = await client.agents.files.upload(fileStream, purpose as any, { fileName });
    this.logMsgPurple(`File uploaded with ID: ${file.id}`);
    return file;
  }

  async createVectorStore(
    client: AIProjectClient,
    fileIds: string[],
    vectorStoreName: string
  ): Promise<string> {
    this.logMsgPurple("Creating the vector store");
    const vectorStore = await client.agents.vectorStores.create({ fileIds, name: vectorStoreName });
    this.logMsgPurple(`✅ Created vector store with ID: ${vectorStore.id}`);
    return vectorStore.id;
  }
}
