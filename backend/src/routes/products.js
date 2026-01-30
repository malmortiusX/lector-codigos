import { Router } from 'express'
import { createConnection, closeConnection } from '../config/database.js'

const router = Router()

/**
 * POST /api/connect
 * Prueba la conexión a SQL Server
 */
router.post('/connect', async (req, res) => {
  const { server, port, database, user, password, trustServerCertificate } = req.body

  if (!server || !database || !user || !password) {
    return res.status(400).json({
      success: false,
      message: 'Faltan campos requeridos: server, database, user, password'
    })
  }

  try {
    const pool = await createConnection({
      server,
      port,
      database,
      user,
      password,
      trustServerCertificate
    })

    // Prueba simple de conexión
    await pool.request().query('SELECT 1 as test')
    await closeConnection()

    res.json({
      success: true,
      message: 'Conexión exitosa a SQL Server'
    })
  } catch (error) {
    console.error('Error de conexión:', error)
    res.status(500).json({
      success: false,
      message: `Error de conexión: ${error.message}`
    })
  }
})

/**
 * POST /api/products
 * Obtiene todos los productos habilitados
 * Recibe la configuración de conexión en el body
 */
router.post('/products', async (req, res) => {
  const { server, port, database, user, password, trustServerCertificate } = req.body

  if (!server || !database || !user || !password) {
    return res.status(400).json({
      success: false,
      message: 'Faltan campos requeridos: server, database, user, password'
    })
  }

  try {
    const pool = await createConnection({
      server,
      port,
      database,
      user,
      password,
      trustServerCertificate
    })

    const result = await pool.request().query(`
      SELECT CODIGO, DESCRIPC 
      FROM PRODUCT 
      WHERE HABILITA = 1
    `)

    await closeConnection()

    res.json({
      success: true,
      count: result.recordset.length,
      products: result.recordset.map(row => ({
        codigo: row.CODIGO?.toString().trim() || '',
        descripcion: row.DESCRIPC?.toString().trim() || ''
      }))
    })
  } catch (error) {
    console.error('Error al obtener productos:', error)
    res.status(500).json({
      success: false,
      message: `Error al obtener productos: ${error.message}`
    })
  }
})

export default router
