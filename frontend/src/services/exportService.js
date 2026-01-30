import { getInventory, getInventoryItems, getProductByCode } from './db'

/**
 * Formatea una fecha en formato dd/mm/YYYY
 * @param {Date} date
 * @returns {string}
 */
function formatDate(date) {
  const d = new Date(date)
  const day = d.getDate()
  const month = d.getMonth() + 1
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

/**
 * Formatea una hora en formato hh:mm:ss
 * @param {Date} date
 * @returns {string}
 */
function formatTime(date) {
  const d = new Date(date)
  const hours = d.getHours().toString().padStart(2, '0')
  const minutes = d.getMinutes().toString().padStart(2, '0')
  const seconds = d.getSeconds().toString().padStart(2, '0')
  return `${hours}:${minutes}:${seconds}`
}

/**
 * Quita ceros a la izquierda de un código
 * @param {string} code
 * @returns {string}
 */
function removeLeadingZeros(code) {
  return code.replace(/^0+/, '') || '0'
}

/**
 * Convierte un número decimal a entero sin punto
 * Ejemplo: 334.00 -> 33400
 * @param {number} value
 * @returns {number}
 */
function toIntegerFormat(value) {
  return Math.round(value * 100)
}

/**
 * Exporta una toma de inventario a formato TXT
 * 
 * Formato de cada línea:
 * consecutivo_fila,fecha,hora,consecutivo_documento,codigo_producto,
 * cantidad_1,cantidad_2,bodega_origen,bodega_destino,ubicacion_origen,
 * ubicacion_destino,lote,nota,vacio,vacio,codigo_barras,descripcion
 * 
 * @param {number} inventoryId - ID de la toma de inventario
 * @returns {Promise<{success: boolean, content?: string, filename?: string, error?: string}>}
 */
export async function exportInventoryToTxt(inventoryId) {
  try {
    const inventory = await getInventory(inventoryId)
    if (!inventory) {
      return { success: false, error: 'Inventario no encontrado' }
    }

    const items = await getInventoryItems(inventoryId)
    if (items.length === 0) {
      return { success: false, error: 'El inventario no tiene items' }
    }

    const lines = []

    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      const rowNumber = i + 1
      const scannedDate = new Date(item.scannedAt)
      
      // Buscar descripción del producto
      let description = ''
      try {
        const product = await getProductByCode(item.productCode)
        if (product) {
          // Quitar comas de la descripción
          description = (product.descripcion || '').replace(/,/g, ' ')
        }
      } catch (e) {
        // Ignorar error, descripción quedará vacía
      }

      // Construir línea según formato especificado
      const lineData = [
        rowNumber,                                           // consecutivo_fila
        formatDate(scannedDate),                             // fecha (dd/mm/YYYY)
        formatTime(scannedDate),                             // hora (hh:mm:ss)
        inventory.documentNumber || '',                      // consecutivo_documento
        removeLeadingZeros(item.productCode),               // codigo_producto (sin ceros)
        toIntegerFormat(item.weight),                       // cantidad_1 (sin decimal)
        toIntegerFormat(item.units),                        // cantidad_2 (sin decimal)
        '',                                                  // bodega_origen
        '',                                                  // bodega_destino
        '',                                                  // ubicacion_origen
        '',                                                  // ubicacion_destino
        item.batch || '',                                    // lote
        '',                                                  // nota (sin comas)
        '',                                                  // vacio
        '',                                                  // vacio
        item.rawBarcode || '',                              // codigo_barras_completo
        description                                          // descripcion_producto
      ]

      lines.push(lineData.join(','))
    }

    const content = lines.join('\n')
    const filename = `inventario_${inventory.documentNumber || inventory.id}_${Date.now()}.txt`

    return {
      success: true,
      content,
      filename
    }
  } catch (error) {
    return {
      success: false,
      error: `Error al exportar: ${error.message}`
    }
  }
}

/**
 * Descarga un archivo de texto
 * @param {string} content - Contenido del archivo
 * @param {string} filename - Nombre del archivo
 */
export function downloadFile(content, filename) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  URL.revokeObjectURL(url)
}

/**
 * Exporta y descarga una toma de inventario
 * @param {number} inventoryId
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function exportAndDownload(inventoryId) {
  const result = await exportInventoryToTxt(inventoryId)
  
  if (!result.success) {
    return result
  }
  
  downloadFile(result.content, result.filename)
  return { success: true }
}
