import { isolatedContainer } from './_shared'

test('all', async () => {
  const { save, all } = await isolatedContainer()

  const objects = await Promise.all([save({}), save({}), save({})])

  const storedObjects = []

  for await (const obj of all()) {
    storedObjects.push(obj)
  }

  expect(objects.map(o => o.id).sort()).toStrictEqual(
    storedObjects.map(o => o.id).sort()
  )
})
