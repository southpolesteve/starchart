import { createClient } from '../src'
import { Agent } from 'https'
import { CosmosClient } from '@azure/cosmos'

const endpoint = process.env.STARCHART_ENDPOINT || 'https://localhost:3000'
const key = process.env.STARCHART_KEY || 'foo'

const cosmosClient = new CosmosClient({
  endpoint,
  key
})

const client = createClient({
  endpoint,
  key,
  agent: new Agent({ rejectUnauthorized: false })
})

export const container = client
  .database('starchart-test')
  .container('starchart-test')

export async function isolatedContainer() {
  const id = Math.random()
    .toString(36)
    .substring(2, 15)

  const { database } = await cosmosClient.databases.createIfNotExists({
    id
  })
  await database.containers.createIfNotExists({ id })

  return client.database(id).container(id)
}
