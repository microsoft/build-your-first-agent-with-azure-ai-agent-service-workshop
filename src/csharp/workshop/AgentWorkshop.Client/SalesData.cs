using System.Data;
using System.Text;
using System.Text.Json;
using Microsoft.Data.Sqlite;

namespace AgentWorkshop.Client;

public class SalesData : IDisposable
{
    private readonly SqliteConnection connection;

    public SalesData(string sharedPath)
    {
        string databasePath = Path.Join(sharedPath, "database", "contoso-sales.db");

        if (!File.Exists(databasePath))
        {
            throw new FileNotFoundException($"Database file not found at {databasePath}");
        }

        connection = new SqliteConnection($"Data Source={databasePath};Mode=ReadOnly");
    }

    public void Dispose()
    {
        connection?.Dispose();
    }

    internal async Task<string> GetDatabaseInfoAsync()
    {
        StringBuilder sb = new();

        await connection.OpenAsync();
        using var getTableNamesCommand = connection.CreateCommand();
        getTableNamesCommand.CommandText = "SELECT name FROM sqlite_master WHERE type='table'";
        using var reader = await getTableNamesCommand.ExecuteReaderAsync();
        while (await reader.ReadAsync())
        {
            string tableName = reader.GetString(0);

            using var getColumnNamesCommand = connection.CreateCommand();
            getColumnNamesCommand.CommandText = $"PRAGMA table_info({tableName})";
            using var columnReader = await getColumnNamesCommand.ExecuteReaderAsync();
            List<string> columnNames = [];
            while (await columnReader.ReadAsync())
            {
                columnNames.Add($"{columnReader.GetString(1)}: ({columnReader.GetString(2)})");
            }
            sb.AppendLine($"Table {tableName} Schema: Columns: {string.Join(", ", columnNames)}");
        }

        sb.AppendLine($"Regions: {string.Join(", ", await GetTableDataAsync("region"))}");
        sb.AppendLine($"Product Types: {string.Join(", ", await GetTableDataAsync("product_type"))}");
        sb.AppendLine($"Product Categories: {string.Join(", ", await GetTableDataAsync("main_category"))}");
        sb.AppendLine($"Reporting Years: {string.Join(", ", await GetTableDataAsync("year", "year"))}");

        await connection.CloseAsync();
        return sb.ToString();

        async Task<IEnumerable<string>> GetTableDataAsync(string column, string? orderBy = null)
        {
            using var getTableDataCommand = connection.CreateCommand();
            getTableDataCommand.CommandText = $"SELECT DISTINCT {column} FROM sales_data{(orderBy is not null ? $" ORDER BY {orderBy}" : "")}";
            using var dataReader = await getTableDataCommand.ExecuteReaderAsync();
            DataTable dataTable = new();
            dataTable.Load(dataReader);
            return dataTable.Rows.Cast<DataRow>().Select(row => string.Join(", ", row.ItemArray));
        }

    }

    /// <summary>
    /// This function is used to answer user questions about Contoso sales data by executing SQLite queries against the database.
    /// </summary>
    /// <param name="query">The input should be a well-formed SQLite query to extract information based on the user's question. The query result will be returned as a JSON object.</param>
    /// <returns>Return data in JSON serializable format.</returns>
    public async Task<string> FetchSalesDataAsync(string query)
    {
        Utils.LogBlue($"Function Call Tools: {nameof(FetchSalesDataAsync)}");
        Utils.LogBlue($"Executing query: {query}");

        await connection.OpenAsync();

        try
        {
            using var command = connection.CreateCommand();
            command.CommandText = query;

            using var reader = await command.ExecuteReaderAsync();

            var dataTable = new DataTable();
            dataTable.Load(reader);

            if (dataTable.Rows.Count == 0)
            {
                return "The query returned no results. Try a different question.";
            }

            Dictionary<string, List<object>> data = [];

            foreach (DataColumn column in dataTable.Columns)
            {
                data[column.ColumnName] = dataTable.Rows.Cast<DataRow>().Select(row => row[column.ColumnName]).ToList();
            }

            return JsonSerializer.Serialize(data);
        }
        catch (Exception ex)
        {
            return JsonSerializer.Serialize(new { Error = ex.Message, Query = query });
        }
        finally
        {
            await connection.CloseAsync();
        }
    }
}