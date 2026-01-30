import sql from 'mssql'

/**
 * Crea una conexión a SQL Server con la configuración proporcionada
 * @param {Object} config - Configuración de conexión
 * @returns {Promise<sql.ConnectionPool>}
 */
export async function createConnection(config) {
  const sqlConfig = {
    user: config.user,
    password: config.password,
    database: config.database,
    server: config.server,
    port: parseInt(config.port) || 1433,
    options: {
      encrypt: config.encrypt || false,
      trustServerCertificate: config.trustServerCertificate || true
    },
    connectionTimeout: 15000,
    requestTimeout: 30000
  }

  const pool = await sql.connect(sqlConfig)
  return pool
}

/**
 * Cierra todas las conexiones activas
 */
export async function closeConnection() {
  await sql.close()
}
