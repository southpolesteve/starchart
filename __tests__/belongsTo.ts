import { container } from './_shared'

test('set on update', async () => {
  const { save, find } = container

  const post = await save({})
  const user = await save({})

  post.author = user

  await save(post)

  // Immediate reload
  expect((await post.author).id).toStrictEqual(user.id)

  // Complete reload
  const post2 = await find(post.id)
  expect((await post2.author).id).toStrictEqual(user.id)
})

test('set on create', async () => {
  const { save, find } = container

  const user = await save({})
  const post = await save({ author: user })

  // Immediate reload
  expect((await post.author).id).toStrictEqual(user.id)

  // Complete reload
  const post2 = await find(post.id)
  expect((await post2.author).id).toStrictEqual(user.id)
})
