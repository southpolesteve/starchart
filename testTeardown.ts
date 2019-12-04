const _global = global as any

export default async function() {
  _global._server.close()
}
