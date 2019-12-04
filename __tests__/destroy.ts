import { container } from "./_shared";

test("by reference", async () => {
  const { save, destroy } = container;

  const obj = await save({});
  await destroy(obj);
});

test("by id", async () => {
  const { save, destroy } = container;

  const obj = await save({});
  await destroy(obj.id);
});
