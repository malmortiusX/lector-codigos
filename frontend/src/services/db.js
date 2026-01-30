import Dexie from 'dexie'

// Crear instancia de base de datos
export const db = new Dexie('LectorInventarios')

// Definir esquema
db.version(1).stores({
  // Configuración del servidor SQL
  config: 'id',
  
  // Productos sincronizados
  products: 'codigo, descripcion',
  
  // Tomas de inventario
  inventories: '++id, documentNumber, createdAt',
  
  // Items de cada toma
  inventoryItems: '++id, inventoryId, productCode, scannedAt'
})

/**
 * Guarda la configuración de SQL Server
 */
export async function saveServerConfig(config) {
  await db.config.put({
    id: 'sqlserver',
    ...config
  })
}

/**
 * Obtiene la configuración de SQL Server
 */
export async function getServerConfig() {
  return await db.config.get('sqlserver')
}

/**
 * Guarda productos en IndexedDB
 */
export async function saveProducts(products) {
  await db.transaction('rw', db.products, db.config, async () => {
    // Limpiar productos anteriores
    await db.products.clear()
    
    // Insertar nuevos productos
    await db.products.bulkAdd(products)
    
    // Guardar fecha de última sincronización
    await db.config.put({
      id: 'lastSync',
      value: new Date().toISOString()
    })
  })
}

/**
 * Obtiene todos los productos
 */
export async function getAllProducts() {
  return await db.products.toArray()
}

/**
 * Busca un producto por código
 */
export async function getProductByCode(codigo) {
  // Buscar con el código exacto
  let product = await db.products.get(codigo)
  
  // Si no encuentra, intentar sin ceros a la izquierda
  if (!product) {
    const codigoSinCeros = codigo.replace(/^0+/, '')
    product = await db.products
      .filter(p => p.codigo.replace(/^0+/, '') === codigoSinCeros)
      .first()
  }
  
  return product
}

/**
 * Crea una nueva toma de inventario
 */
export async function createInventory(documentNumber) {
  const id = await db.inventories.add({
    documentNumber,
    createdAt: new Date().toISOString(),
    totalItems: 0
  })
  return id
}

/**
 * Obtiene todas las tomas de inventario
 */
export async function getAllInventories() {
  const inventories = await db.inventories.orderBy('createdAt').reverse().toArray()
  
  // Agregar conteo de items a cada inventario
  for (const inv of inventories) {
    inv.totalItems = await db.inventoryItems.where('inventoryId').equals(inv.id).count()
  }
  
  return inventories
}

/**
 * Obtiene una toma de inventario por ID
 */
export async function getInventory(id) {
  return await db.inventories.get(id)
}

/**
 * Actualiza el número de documento de una toma
 */
export async function updateInventoryDocument(id, documentNumber) {
  await db.inventories.update(id, { documentNumber })
}

/**
 * Elimina una toma de inventario y sus items
 */
export async function deleteInventory(id) {
  await db.transaction('rw', db.inventories, db.inventoryItems, async () => {
    await db.inventoryItems.where('inventoryId').equals(id).delete()
    await db.inventories.delete(id)
  })
}

/**
 * Agrega un item a una toma de inventario
 */
export async function addInventoryItem(inventoryId, item) {
  const id = await db.inventoryItems.add({
    inventoryId,
    rawBarcode: item.rawBarcode,
    productCode: item.productCode,
    weight: item.weight,
    units: item.units,
    batch: item.batch,
    consecutive: item.consecutive,
    scannedAt: new Date().toISOString()
  })
  
  // Actualizar contador
  const count = await db.inventoryItems.where('inventoryId').equals(inventoryId).count()
  await db.inventories.update(inventoryId, { totalItems: count })
  
  return id
}

/**
 * Obtiene todos los items de una toma
 */
export async function getInventoryItems(inventoryId) {
  return await db.inventoryItems
    .where('inventoryId')
    .equals(inventoryId)
    .toArray()
}

/**
 * Elimina el último item de una toma
 */
export async function deleteLastItem(inventoryId) {
  const items = await db.inventoryItems
    .where('inventoryId')
    .equals(inventoryId)
    .reverse()
    .limit(1)
    .toArray()
  
  if (items.length > 0) {
    await db.inventoryItems.delete(items[0].id)
    
    // Actualizar contador
    const count = await db.inventoryItems.where('inventoryId').equals(inventoryId).count()
    await db.inventories.update(inventoryId, { totalItems: count })
    
    return true
  }
  
  return false
}

/**
 * Obtiene el conteo de productos
 */
export async function getProductsCount() {
  return await db.products.count()
}

/**
 * Obtiene la fecha de última sincronización
 */
export async function getLastSyncDate() {
  const syncInfo = await db.config.get('lastSync')
  return syncInfo ? new Date(syncInfo.value) : null
}
