import Database from 'better-sqlite3'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

const DB_PATH = join(__dirname, '../../data/finance.db')

// Ensure data directory exists
import { mkdirSync } from 'fs'
try {
  mkdirSync(join(__dirname, '../../data'), { recursive: true })
} catch {}

let _db = null

export function getDb() {
  if (!_db) {
    _db = new Database(DB_PATH)
    _db.pragma('journal_mode = WAL')
    _db.pragma('foreign_keys = ON')

    const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf-8')
    _db.exec(schema)
  }
  return _db
}

export default getDb
