require("dotenv").config();
const { CosmosClient } = require("@azure/cosmos");

const endpoint = "https://stfaul.documents.azure.com:443/";
const key =
  "zy8FVZe0jHSEDPjwE2Q4RHgoz3hHqJ9NqxVTxB7NSpY9XG9jZtOvzlG19ijay5R1diBaYpjRTfnI6vwgP8UOZg==";

async function main() {
  const { database } = await new CosmosClient({
    endpoint,
    key
  }).databases.createIfNotExists({ id: "starchart-test" });

  const { container } = await database.containers.createIfNotExists({
    id: "todos"
  });

  const { resources } = await container.items.readAll().fetchAll();

  for (const item of resources) {
    await container.item(item.id, item._partitionKey).delete();
    console.log("Deleted", item.id, item._partitionKey);
  }
}

main();
