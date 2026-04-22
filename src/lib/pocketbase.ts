import PocketBase from 'pocketbase'

const pocketBase = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://localhost:8090')

export default pocketBase
