import { getDb } from './client.js'

const db = getDb()
console.log('Database migrated successfully.')
console.log('Tables:', db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(r => r.name).join(', '))
