import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const KEY_LENGTH = 32
const IV_LENGTH = 12
const TAG_LENGTH = 16

function getKey() {
  const keyHex = process.env.ENCRYPTION_KEY
  if (!keyHex || keyHex.length < 64) {
    // Generate an ephemeral key for the session if none is set
    if (!globalThis._ephemeralKey) {
      globalThis._ephemeralKey = randomBytes(KEY_LENGTH)
    }
    return globalThis._ephemeralKey
  }
  return Buffer.from(keyHex, 'hex').slice(0, KEY_LENGTH)
}

export function encrypt(plaintext) {
  const key = getKey()
  const iv = randomBytes(IV_LENGTH)
  const cipher = createCipheriv(ALGORITHM, key, iv)
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return Buffer.concat([iv, tag, encrypted]).toString('base64')
}

export function decrypt(ciphertext) {
  const key = getKey()
  const data = Buffer.from(ciphertext, 'base64')
  const iv = data.slice(0, IV_LENGTH)
  const tag = data.slice(IV_LENGTH, IV_LENGTH + TAG_LENGTH)
  const encrypted = data.slice(IV_LENGTH + TAG_LENGTH)
  const decipher = createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(tag)
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8')
}
