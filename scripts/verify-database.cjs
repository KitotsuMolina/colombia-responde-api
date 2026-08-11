const { Client } = require('pg')

const connectionString = process.env.DATABASE_DIRECT_URL || process.env.DATABASE_URL
if (!connectionString) {
  console.error('DATABASE_DIRECT_URL o DATABASE_URL es obligatoria')
  process.exit(1)
}

async function verify() {
  const client = new Client({ connectionString })
  await client.connect()
  try {
    const extensions = await client.query("SELECT extname FROM pg_extension WHERE extname IN ('postgis','pg_trgm','unaccent') ORDER BY extname")
    const tables = await client.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('incidents','missing_persons','resources') ORDER BY tablename")
    const expectedExtensions = ['pg_trgm', 'postgis', 'unaccent']
    const expectedTables = ['incidents', 'missing_persons', 'resources']
    const actualExtensions = extensions.rows.map((row) => row.extname)
    const actualTables = tables.rows.map((row) => row.tablename)
    if (JSON.stringify(actualExtensions) !== JSON.stringify(expectedExtensions) || JSON.stringify(actualTables) !== JSON.stringify(expectedTables)) {
      throw new Error(`Esquema incompleto. Extensiones: ${actualExtensions.join(', ')}. Tablas: ${actualTables.join(', ')}`)
    }
    console.log('Base verificada: PostGIS, pg_trgm, unaccent e esquema inicial disponibles')
  } finally {
    await client.end()
  }
}

verify().catch((error) => {
  console.error('Verificación fallida:', error.message)
  process.exit(1)
})
