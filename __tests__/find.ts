import { container } from './_shared'

test('by reference', async () => {
  const { save, find } = container

  const obj = await save({})
  const obj2 = await find(obj)
  if (obj2 === undefined) {
    throw new Error('obj2 was undefined')
  }
  expect(obj.id).toStrictEqual(obj2.id)
})

test('by id', async () => {
  const { save, find } = container

  const obj = await save({})
  const obj2 = await find(obj.id)
  if (obj2 === undefined) {
    throw new Error('obj2 was undefined')
  }
  expect(obj.id).toStrictEqual(obj2.id)
})

test('not found', async () => {
  const { find } = container

  const obj2 = await find('doesnotexist')
  expect(obj2).toBe(undefined)
})
