import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useBarcode } from '../hooks/useBarcode'
import { 
  getInventory, 
  getInventoryItems, 
  deleteLastItem,
  updateInventoryDocument,
  getProductByCode 
} from '../services/db'
import { formatWeight, formatUnits } from '../services/barcodeParser'

function NewInventory() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [inventory, setInventory] = useState(null)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingDoc, setEditingDoc] = useState(false)
  const [docNumber, setDocNumber] = useState('')

  // Cargar inventario existente o crear uno nuevo
  useEffect(() => {
    if (id && id !== 'new') {
      loadInventory(parseInt(id))
    } else {
      // Si es nuevo, redirigir a home para crear desde el modal
      navigate('/')
    }
  }, [id, navigate])

  async function loadInventory(inventoryId) {
    try {
      const inv = await getInventory(inventoryId)
      if (!inv) {
        navigate('/')
        return
      }
      setInventory(inv)
      setDocNumber(inv.documentNumber || '')

      const invItems = await getInventoryItems(inventoryId)
      // Cargar descripciones de productos
      const itemsWithProducts = await Promise.all(
        invItems.map(async (item) => {
          try {
            const product = await getProductByCode(item.productCode)
            return { ...item, productDescription: product?.descripcion || '' }
          } catch {
            return { ...item, productDescription: '' }
          }
        })
      )
      setItems(itemsWithProducts.reverse()) // Mostrar más recientes primero
    } catch (error) {
      console.error('Error cargando inventario:', error)
    } finally {
      setLoading(false)
    }
  }

  // Callback cuando se escanea un código
  const handleScan = useCallback(async (result) => {
    if (result.success) {
      // Recargar items
      if (inventory) {
        const invItems = await getInventoryItems(inventory.id)
        const itemsWithProducts = await Promise.all(
          invItems.map(async (item) => {
            try {
              const product = await getProductByCode(item.productCode)
              return { ...item, productDescription: product?.descripcion || '' }
            } catch {
              return { ...item, productDescription: '' }
            }
          })
        )
        setItems(itemsWithProducts.reverse())
      }
    }
  }, [inventory])

  const {
    inputRef,
    inputValue,
    isProcessing,
    lastError,
    handleInputChange,
    handleKeyDown,
    focusInput,
    clearError
  } = useBarcode(inventory?.id, handleScan)

  async function handleDeleteLast() {
    if (!inventory || items.length === 0) return
    
    if (!confirm('¿Eliminar el último código escaneado?')) return

    try {
      await deleteLastItem(inventory.id)
      const invItems = await getInventoryItems(inventory.id)
      const itemsWithProducts = await Promise.all(
        invItems.map(async (item) => {
          try {
            const product = await getProductByCode(item.productCode)
            return { ...item, productDescription: product?.descripcion || '' }
          } catch {
            return { ...item, productDescription: '' }
          }
        })
      )
      setItems(itemsWithProducts.reverse())
    } catch (error) {
      console.error('Error eliminando item:', error)
    }
  }

  async function handleSaveDocNumber() {
    if (!inventory) return
    
    try {
      await updateInventoryDocument(inventory.id, docNumber)
      setInventory({ ...inventory, documentNumber: docNumber })
      setEditingDoc(false)
    } catch (error) {
      console.error('Error actualizando documento:', error)
    }
  }

  function formatItemCode(code) {
    // Mostrar código sin ceros a la izquierda
    return code.replace(/^0+/, '') || '0'
  }

  if (loading) {
    return <div className="loading">Cargando...</div>
  }

  if (!inventory) {
    return <div className="loading">Inventario no encontrado</div>
  }

  return (
    <div className="inventory-page" onClick={focusInput}>
      {/* Document number */}
      <div className="card" style={{ padding: 'var(--spacing-md)' }}>
        {editingDoc ? (
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
            <input
              type="text"
              className="form-input"
              value={docNumber}
              onChange={e => setDocNumber(e.target.value)}
              placeholder="Número de documento"
              style={{ flex: 1 }}
            />
            <button className="btn btn-primary" onClick={handleSaveDocNumber}>
              ✓
            </button>
            <button className="btn btn-secondary" onClick={() => setEditingDoc(false)}>
              ×
            </button>
          </div>
        ) : (
          <div 
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
            onClick={() => setEditingDoc(true)}
          >
            <span>
              <strong>Doc:</strong> {inventory.documentNumber || 'Sin número'}
            </span>
            <span style={{ color: 'var(--accent)' }}>Editar</span>
          </div>
        )}
      </div>

      {/* Counter */}
      <div className="inventory-counter">
        <span>Códigos escaneados:</span>
        <span className="counter-value">{items.length}</span>
      </div>

      {/* Barcode input */}
      <div className="barcode-input-container">
        <input
          ref={inputRef}
          type="text"
          className="form-input barcode-input"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={isProcessing ? 'Procesando...' : 'Escanear código...'}
          disabled={isProcessing}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
        />
      </div>

      {/* Error message */}
      {lastError && (
        <div className="message message-error" onClick={clearError}>
          {lastError}
        </div>
      )}

      {/* Delete last button */}
      {items.length > 0 && (
        <button 
          className="btn btn-danger btn-block mb-md"
          onClick={handleDeleteLast}
        >
          Eliminar último
        </button>
      )}

      {/* Scanned items */}
      <div className="scanned-items">
        {items.length === 0 ? (
          <div className="empty-state">
            <p>Escanea códigos de barras</p>
            <p className="text-muted">Los códigos aparecerán aquí</p>
          </div>
        ) : (
          items.map((item, index) => (
            <div key={item.id} className="scanned-item">
              <div className="scanned-item-code">
                #{items.length - index} · {item.rawBarcode}
              </div>
              <div className="scanned-item-product">
                {item.productDescription || `Producto: ${formatItemCode(item.productCode)}`}
              </div>
              <div className="scanned-item-details">
                Peso: {formatWeight(item.weight)} · 
                Unidades: {formatUnits(item.units)} · 
                Lote: {item.batch}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default NewInventory
