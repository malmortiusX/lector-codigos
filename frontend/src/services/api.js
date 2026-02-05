const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002'

/**
 * Verifica si hay conexión a internet
 * @returns {boolean}
 */
function isOnline() {
  return navigator.onLine
}

/**
 * Prueba la conexión a SQL Server
 * @param {Object} config - Configuración de conexión
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function testConnection(config) {
  if (!isOnline()) {
    return {
      success: false,
      message: 'Sin conexión a internet. Verifica tu conexión de red.'
    }
  }

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 segundos timeout
    console.log(`${API_URL}/api/connect`);

    const response = await fetch(`${API_URL}/lector-codigos/api/connect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(config),
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    if (error.name === 'AbortError') {
      return {
        success: false,
        message: 'Tiempo de espera agotado. Verifica la conexión al servidor.'
      }
    }
    return {
      success: false,
      message: `Error de red: ${error.message}`
    }
  }
}

/**
 * Obtiene los productos del servidor SQL Server
 * @param {Object} config - Configuración de conexión
 * @returns {Promise<{success: boolean, products?: Array, count?: number, message?: string}>}
 */
export async function fetchProducts(config) {
  if (!isOnline()) {
    return {
      success: false,
      message: 'Sin conexión a internet. La sincronización requiere conexión de red.'
    }
  }

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 segundos timeout

    const response = await fetch(`${API_URL}/api/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(config),
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    if (error.name === 'AbortError') {
      return {
        success: false,
        message: 'Tiempo de espera agotado. Verifica la conexión al servidor.'
      }
    }
    return {
      success: false,
      message: `Error de red: ${error.message}`
    }
  }
}
