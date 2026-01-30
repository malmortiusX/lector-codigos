import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { fetchProducts } from '../services/api'
import { saveProducts, getProductsCount, getLastSyncDate } from '../services/db'

function SyncProducts() {
  const { config, isOnline, updateProductsInfo } = useApp()
  const [syncing, setSyncing] = useState(false)
  const [message, setMessage] = useState(null)
  const [productsCount, setProductsCount] = useState(0)
  const [lastSync, setLastSync] = useState(null)

  useEffect(() => {
    loadInfo()
  }, [])

  async function loadInfo() {
    try {
      const count = await getProductsCount()
      setProductsCount(count)
      
      const syncDate = await getLastSyncDate()
      setLastSync(syncDate)
    } catch (error) {
      console.error('Error cargando info:', error)
    }
  }

  async function handleSync() {
    if (!config) {
      setMessage({ type: 'error', text: 'Configura el servidor SQL primero' })
      return
    }

    if (!isOnline) {
      setMessage({ type: 'warning', text: 'Sin conexión a internet' })
      return
    }

    setSyncing(true)
    setMessage(null)

    try {
      const result = await fetchProducts(config)

      if (!result.success) {
        setMessage({ type: 'error', text: result.message })
        return
      }

      // Guardar productos en IndexedDB
      await saveProducts(result.products)
      
      // Actualizar info local
      await loadInfo()
      await updateProductsInfo()

      setMessage({ 
        type: 'success', 
        text: `${result.count} productos sincronizados correctamente` 
      })
    } catch (error) {
      setMessage({ type: 'error', text: `Error: ${error.message}` })
    } finally {
      setSyncing(false)
    }
  }

  function formatDate(date) {
    if (!date) return 'Nunca'
    return new Date(date).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="sync-page">
      <div className="card">
        <div className="sync-info">
          <div className="sync-count">{productsCount}</div>
          <div className="sync-label">Productos almacenados</div>
          <div className="sync-date">
            Última sincronización: {formatDate(lastSync)}
          </div>
        </div>

        {message && (
          <div className={`message message-${message.type}`}>
            {message.text}
          </div>
        )}

        <button 
          className="btn btn-primary btn-block btn-lg"
          onClick={handleSync}
          disabled={syncing || !isOnline}
        >
          {syncing ? 'Sincronizando...' : 'Actualizar Productos'}
        </button>

        {!isOnline && (
          <p className="text-muted text-center mt-md">
            Requiere conexión a internet
          </p>
        )}

        {!config && (
          <p className="text-muted text-center mt-md">
            Configura el servidor SQL Server primero
          </p>
        )}
      </div>

      <div className="card mt-md">
        <h3 className="card-title">Modo Offline</h3>
        <p className="text-muted">
          Una vez sincronizados los productos, puedes trabajar sin conexión.
          Los códigos escaneados se relacionarán con los productos almacenados localmente.
        </p>
      </div>
    </div>
  )
}

export default SyncProducts
