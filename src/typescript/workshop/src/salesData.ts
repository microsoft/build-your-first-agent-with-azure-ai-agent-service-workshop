import * as path from 'path';
import BetterSqlite3 from 'better-sqlite3';
import { Utilities } from './utilities.js';
import { TerminalColors as tc } from './terminalColors.js';

const DATA_BASE = "database/contoso-sales.db";

export class SalesData {
  private db: BetterSqlite3.Database | null = null;
  private utilities: Utilities;

  constructor(utilities: Utilities) {
    this.utilities = utilities;
  }

  // Add to SalesData class
    async executeQuery(query: string): Promise<any[]> {
    if (!this.db) throw new Error("Database not connected");
    
    // Validate query is SELECT only
    const trimmedQuery = query.trim().toLowerCase();
    if (!trimmedQuery.startsWith('select')) {
        throw new Error("Only SELECT queries are allowed");
    }
    
    // Check for potentially dangerous keywords
    const dangerousKeywords = ['drop', 'delete', 'update', 'insert', 'create', 'alter', 'truncate'];
    if (dangerousKeywords.some(keyword => trimmedQuery.includes(keyword))) {
        throw new Error("Query contains forbidden operations");
    }

    try {
        const stmt = this.db.prepare(query);
        return stmt.all();
    } catch (error) {
        console.error(`Error executing query: ${query}`, error);
        throw error;
    }
    }

  async connect(): Promise<void> {
    try {
      const dbPath = path.join(this.utilities.sharedFilesPath, DATA_BASE);
      this.db = new BetterSqlite3(dbPath, { readonly: true });
      console.log("Database connection opened.");
    } catch (error) {
      console.error("Error connecting to database:", error);
      this.db = null;
    }
  }

  async close(): Promise<void> {
    if (this.db) {
      this.db.close();
      console.log("Database connection closed.");
    }
  }

  private getTableNames(): string[] {
    if (!this.db) throw new Error("Database not connected");
    
    const tables = this.db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    return tables
      .map((table: any) => table.name)
      .filter((name: string) => name !== 'sqlite_sequence');
  }

  private getColumnInfo(tableName: string): string[] {
    if (!this.db) throw new Error("Database not connected");
    
    const columns = this.db.prepare(`PRAGMA table_info('${tableName}')`).all();
    return columns.map((col: any) => `${col.name}: (${col.type})`);
  }

  private getRegions(): string[] {
    if (!this.db) throw new Error("Database not connected");
    
    const regions = this.db.prepare("SELECT DISTINCT region FROM sales_data").all();
    return regions.map((region: any) => region.region);
  }

  private getProductTypes(): string[] {
    if (!this.db) throw new Error("Database not connected");
    
    const types = this.db.prepare("SELECT DISTINCT product_type FROM sales_data").all();
    return types.map((type: any) => type.product_type);
  }

  private getProductCategories(): string[] {
    if (!this.db) throw new Error("Database not connected");
    
    const categories = this.db.prepare("SELECT DISTINCT main_category FROM sales_data").all();
    return categories.map((category: any) => category.main_category);
  }

  private getReportingYears(): string[] {
    if (!this.db) throw new Error("Database not connected");
    
    const years = this.db.prepare("SELECT DISTINCT year FROM sales_data ORDER BY year").all();
    return years.map((year: any) => year.year.toString());
  }

  async getDatabaseInfo(): Promise<string> {
    if (!this.db) throw new Error("Database not connected");
    
    const tableDicts = [];
    
    for (const tableName of this.getTableNames()) {
      const columnNames = this.getColumnInfo(tableName);
      tableDicts.push({ table_name: tableName, column_names: columnNames });
    }

    let databaseInfo = tableDicts.map(table => 
      `Table ${table.table_name} Schema: Columns: ${table.column_names.join(', ')}`
    ).join('\n');

    const regions = this.getRegions();
    const productTypes = this.getProductTypes();
    const productCategories = this.getProductCategories();
    const reportingYears = this.getReportingYears();

    databaseInfo += `\nRegions: ${regions.join(', ')}`;
    databaseInfo += `\nProduct Types: ${productTypes.join(', ')}`;
    databaseInfo += `\nProduct Categories: ${productCategories.join(', ')}`;
    databaseInfo += `\nReporting Years: ${reportingYears.join(', ')}`;
    databaseInfo += '\n\n';

    return databaseInfo;
  }
}

/**
 * This function is used to answer user questions about Contoso sales data by executing SQLite queries against the database.
 * 
 * @param params - Function parameters
 * @param params.query - The input should be a well-formed SQLite query to extract information based on the user's question. The query result will be returned as a JSON object.
 * @returns Return data in JSON serializable format.
 */
export async function fetchSalesDataUsingQuery(params: { query: string }): Promise<string> {
  console.log(`\n${tc.BLUE}Function Call Tools: fetchSalesDataUsingQuery${tc.RESET}\n`);
  console.log(`${tc.BLUE}Executing query: ${params.query}${tc.RESET}\n`);

  const utilities = new Utilities();
  const salesData = new SalesData(utilities);
  await salesData.connect();

  try {
    // Use the existing executeQuery method instead of direct database access
    const rows = await salesData.executeQuery(params.query);
    
    if (rows.length === 0) {
      return JSON.stringify("The query returned no results. Try a different question.");
    }
    
    const columnNames = Object.keys(rows[0]);
    const data: { columns: string[], data: any[][] } = {
      columns: columnNames,
      data: rows.map(row => columnNames.map(col => row[col]))
    };
    
    return JSON.stringify(data);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return JSON.stringify({
      "SQLite query failed with error": errorMessage,
      "query": params.query
    });
  } finally {
    await salesData.close();
  }
}