process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0

import cosmosServer from '@zeit/cosmosdb-server'
import { CosmosClient } from '@azure/cosmos'

const endpoint = 'https://localhost:3000'
const key = 'foo'

export const client = new CosmosClient({
  endpoint,
  key
})

const _global = global as any

export default async function startServer() {
  const startServer = new Promise((resolve, reject) => {
    _global._server = cosmosServer().listen(3000, () => {
      resolve()
    })
  })

  await startServer

  const { database } = await client.databases.createIfNotExists({
    id: 'starchart-test'
  })
  await database.containers.createIfNotExists({ id: 'starchart-test' })
}
