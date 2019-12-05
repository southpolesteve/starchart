import { CosmosClient } from '@azure/cosmos'
import shortid from 'shortid'
import { Agent } from 'https'

interface ClientOptions {
  endpoint: string
  key: string
  agent: Agent
}

const isPersisted = Symbol('isPersisted')
const partitionKey = Symbol('partitionKey')
const objType = Symbol('objType')

export interface Item {
  readonly id: string
  readonly _partitionKey: string
  readonly [isPersisted]: boolean
  [key: string]: any
}

export function createClient(options: ClientOptions) {
  // TODO: Build this library without referencing the existing cosmos SDK
  const _client = new CosmosClient({
    endpoint: options.endpoint,
    key: options.key,
    agent: options.agent
  })

  return {
    database: (databaseId: string) => ({
      container: (containerId: string) => {
        const container = _client.database(databaseId).container(containerId)
        const handler = {
          get(obj: any, prop: any) {
            if (prop === 'toJSON') {
              return function() {
                return obj
              }
            }
            const value = Reflect.get(obj, prop)
            if (
              value &&
              typeof value === 'string' &&
              value.startsWith('_ref')
            ) {
              const [_, id] = value.split(':')
              return container
                .item(id, id)
                .read()
                .then(
                  res =>
                    new Proxy({ [isPersisted]: true, ...res.resource }, handler)
                )
            }
            return value
          },
          set(obj: any, prop: any, value: any) {
            if (typeof value === 'object' && value.id) {
              return Reflect.set(obj, prop, `_ref:${value.id}`)
            }
            if (typeof value === 'object' && value[objType] === 'collection') {
              value[partitionKey] = [obj.id, prop].join('|')
            }
            return Reflect.set(obj, prop, value)
          }
        }
        return {
          all() {
            return {
              [Symbol.asyncIterator]: async function*() {
                const query = `SELECT * from c`
                const iterator = container.items.query(query)
                while (iterator.hasMoreResults()) {
                  const { resources } = await iterator.fetchNext()
                  for (const item of resources) {
                    yield item
                  }
                }
              }
            }
          },
          async destroy<T extends { id: string }>(
            item: string | T
          ): Promise<void> {
            const id = typeof item === 'object' ? item.id : item
            await container.item(id, id).delete()
          },
          async find<T extends { id: string }>(
            item: string | T
          ): Promise<(T & Item) | undefined> {
            const id = typeof item === 'object' ? item.id : item
            const { resource } = await container.item(id, id).read()
            if (resource) {
              return new Proxy({ [isPersisted]: true, ...resource }, handler)
            }
            return undefined
          },
          async save<T>(item: T): Promise<T & Item> {
            writeRefs(item)
            if ((item as any)[isPersisted] === true) {
              const { resource } = await container.items.upsert(item)
              return new Proxy(resource, handler) as any
            }
            const id = shortid()
            const { resource } = await container.items.create({
              ...item,
              id,
              _partitionKey: id
            })
            return new Proxy({ [isPersisted]: true, ...resource }, handler)
          },
          collection() {
            return {
              [objType]: 'collection',
              [partitionKey]: undefined,
              async add(item: any) {
                await container.items.upsert({
                  id: item.id,
                  _partitionKey: this[partitionKey]
                })
              },
              [Symbol.asyncIterator]: async function*() {
                const query = `SELECT c.id from c WHERE c._partitionKey = "${this[partitionKey]}"`
                const iterator = container.items.query(query)
                while (iterator.hasMoreResults()) {
                  const { resources } = await iterator.fetchNext()
                  for (const item of resources) {
                    const fullItem = await container
                      .item(item.id, item.id)
                      .read()
                    yield fullItem.resource
                  }
                }
              },
              async remove(item: any) {
                await container.item(item.id, this[partitionKey]).delete()
              }
            }
          }
        }
      }
    })
  }
}

const writeRefs = (obj: any) => {
  Object.keys(obj).forEach(key => {
    if (typeof obj[key] === 'object') {
      if (obj[key][isPersisted] === true) {
        obj[key] = `_ref:${obj[key].id}`
      } else {
        writeRefs(obj[key])
      }
    }
  })
}
