import { randomBytes } from 'crypto'

const key = randomBytes(32).toString('hex')
console.log('Generated encryption key:')
console.log(key)
console.log('\nAdd this to your .env file:')
console.log(`ENCRYPTION_KEY=${key}`)
