const fs = require('node:fs/promises')
const path = require('node:path')
const { Client } = require('pg')
require('dotenv').config()

const connectionString = process.env.DATABASE_DIRECT_URL || process.env.DATABASE_URL
if (!connectionString) {
  console.error('DATABASE_DIRECT_URL o DATABASE_URL es obligatoria')
  process.exit(1)
}

async function migrate() {
  const sql = await fs.readFile(path.join(__dirname, '..', 'migrations', '001_initial.sql'), 'utf8')
  const client = new Client({ connectionString })
  await client.connect()
  try {
    await client.query('BEGIN')
    await client.query(sql)
    await client.query('COMMIT')
    console.log('Migración 001_initial aplicada correctamente')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    await client.end()
  }
}

migrate().catch((error) => {
  console.error('No fue posible aplicar la migración:', error.message)
  process.exit(1)
})
