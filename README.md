# Starchart

|🚧 WARNING: Alpha software. Under heavy development. Breaking changes at anytime 🚧 |

Starchart is an opinionated SDK for Azure Cosmos DB with baked in best practices for storing documents and relationships

## Installation

`npm install starchart`

## Typescript Quick Start

```ts
import { createClient } from "starchart";

const client = createClient({
  endpoint: "https://your-cosmos-endpoint.cosmos.azure.com",
  key: "your cosmos key"
});

const container = client.database("production").container("todos");

async function main() {
  // Create a new todo
  const todo = await container.save({
    title: "Try out Starchart",
    state: "started"
  });
  todo.state = "done";

  // Update a todo
  await container.save(todo);

  // Delete a todo
  await container.destroy(todo);
}

main();
```

A complete backend for TodoMVC can be found in `examples/todo-backend` that shows the full API surface

## Why?

Many newcomers to NoSQL databases find it difficult to model data. Developers with SQL backgrounds will rely on patterns that are anti-patterns in NoSQL:

- SQL patterns

  - Table per entity
  - Normalized
  - Retrieve data with single complex query

- NoSQL patterns
  - Single table for all entities
  - Denormalized
  - Retrieve data with multiple simple queries

Rather than force a developer to learn these new patterns upfront, Starchart bakes them straight into the SDK. It is always possible to fall back to the standard `@azure/cosmos` SDK for full control.

## Contributing

Contributions welcome!

### Developement

`npm install` - Install all production and development dependencies

### Testing

`npm test` - Runs test locally against a [simulated Cosmos backend](https://github.com/zeit/cosmosdb-server)

All PRs will run tests on Github Actions
