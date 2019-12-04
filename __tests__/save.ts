import { container } from './_shared'

test('create', async () => {
  const { save } = container

  const obj = await save({})
  expect(typeof obj.id).toBe('string')
  expect(typeof obj._partitionKey).toBe('string')
  expect(obj.id).toBe(obj._partitionKey)
})

test('update', async () => {
  const { save, find } = container

  const obj = await save({})
  obj.foo = 'bar'
  await save(obj)

  const obj2 = await find(obj.id)
  if (obj2 === undefined) {
    throw new Error('obj2 was undefined')
  }
  expect(obj2.foo).toBe('bar')
})
