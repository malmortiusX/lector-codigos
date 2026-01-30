/**
 * Parser de códigos de barras con estructura fija
 * 
 * Estructura (39 caracteres):
 * - Posición 0-1: Prefijo "90" (2)
 * - Posición 2-11: Código de producto (10)
 * - Posición 12-15: Peso entero (4)
 * - Posición 16-17: Peso decimal (2)
 * - Posición 18-21: Unidades entero (4)
 * - Posición 22-23: Unidades decimal (2)
 * - Posición 24-28: Lote de producción (5)
 * - Posición 29-38: Consecutivo (10)
 */

const BARCODE_LENGTH = 39
const PREFIX = '90'

/**
 * Parsea un código de barras según la estructura definida
 * @param {string} barcode - Código de barras completo
 * @returns {Object|null} - Objeto con los datos parseados o null si es inválido
 */
export function parseBarcode(barcode) {
  // Limpiar espacios
  const code = barcode.trim()
  
  // Validar longitud
  if (code.length !== BARCODE_LENGTH) {
    return {
      valid: false,
      error: `Longitud inválida: ${code.length} caracteres (esperado: ${BARCODE_LENGTH})`
    }
  }
  
  // Validar prefijo
  const prefix = code.substring(0, 2)
  if (prefix !== PREFIX) {
    return {
      valid: false,
      error: `Prefijo inválido: ${prefix} (esperado: ${PREFIX})`
    }
  }
  
  // Extraer campos
  const productCode = code.substring(2, 12)
  const weightInt = code.substring(12, 16)
  const weightDec = code.substring(16, 18)
  const unitsInt = code.substring(18, 22)
  const unitsDec = code.substring(22, 24)
  const batch = code.substring(24, 29)
  const consecutive = code.substring(29, 39)
  
  // Calcular peso y unidades como números decimales
  const weight = parseFloat(`${weightInt}.${weightDec}`)
  const units = parseFloat(`${unitsInt}.${unitsDec}`)
  
  // Validar que peso y unidades sean números válidos
  if (isNaN(weight) || isNaN(units)) {
    return {
      valid: false,
      error: 'Formato numérico inválido en peso o unidades'
    }
  }
  
  return {
    valid: true,
    rawBarcode: code,
    prefix,
    productCode,
    productCodeClean: productCode.replace(/^0+/, '') || '0', // Sin ceros a la izquierda
    weight,
    weightRaw: parseInt(weightInt + weightDec, 10), // Sin punto decimal para exportación
    units,
    unitsRaw: parseInt(unitsInt + unitsDec, 10), // Sin punto decimal para exportación
    batch,
    consecutive
  }
}

/**
 * Valida si un código de barras tiene el formato correcto
 * @param {string} barcode - Código de barras
 * @returns {boolean}
 */
export function isValidBarcode(barcode) {
  const result = parseBarcode(barcode)
  return result.valid === true
}

/**
 * Formatea el peso para mostrar
 * @param {number} weight - Peso como número decimal
 * @returns {string}
 */
export function formatWeight(weight) {
  return weight.toFixed(2) + ' kg'
}

/**
 * Formatea las unidades para mostrar
 * @param {number} units - Unidades como número decimal
 * @returns {string}
 */
export function formatUnits(units) {
  return units.toFixed(2) + ' uds'
}
