import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getAllInventories, deleteInventory, createInventory } from '../services/db'
import { exportAndDownload } from '../services/exportService'
import { useApp } from '../context/AppContext'

function Home() {
  const navigate = useNavigate()
  const { productsCount } = useApp()
  const [inventories, setInventories] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState(null)
  const [showNewModal, setShowNewModal] = useState(false)
  const [newDocNumber, setNewDocNumber] = useState('')

  useEffect(() => {
    loadInventories()
  }, [])

  async function loadInventories() {
    try {
      const data = await getAllInventories()
      setInventories(data)
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al cargar inventarios' })
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateNew() {
    if (!newDocNumber.trim()) {
      setMessage({ type: 'error', text: 'Ingrese un número de documento' })
      return
    }

    try {
      const id = await createInventory(newDocNumber.trim())
      setShowNewModal(false)
      setNewDocNumber('')
      navigate(`/lector-codigos/inventory/${id}`)
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al crear inventario' })
    }
  }

  async function handleDelete(id) {
    if (!confirm('¿Eliminar esta toma de inventario?')) return

    try {
      await deleteInventory(id)
      await loadInventories()
      setMessage({ type: 'success', text: 'Inventario eliminado' })
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al eliminar' })
    }
  }

  async function handleExport(id) {
    setMessage(null)
    const result = await exportAndDownload(id)
    
    if (result.success) {
      setMessage({ type: 'success', text: 'Archivo exportado correctamente' })
    } else {
      setMessage({ type: 'error', text: result.error })
    }
  }

  function formatDate(dateStr) {
    const date = new Date(dateStr)
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return <div className="loading">Cargando...</div>
  }

  return (
    <div className="home-page">
      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{inventories.length}</div>
          <div className="stat-label">Tomas</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{productsCount}</div>
          <div className="stat-label">Productos</div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="action-bar">
        <button 
          className="btn btn-primary btn-lg"
          onClick={() => setShowNewModal(true)}
        >
          + Nueva Toma
        </button>
      </div>

      <div className="action-bar">
        <Link to="/lector-codigos/settings" className="btn btn-secondary">
          Configuración
        </Link>
        <Link to="/lector-codigos/sync" className="btn btn-secondary">
          Sincronizar
        </Link>
      </div>

      {/* Messages */}
      {message && (
        <div className={`message message-${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Inventory list */}
      {inventories.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <p>No hay tomas de inventario</p>
          <p className="text-muted">Crea una nueva para comenzar</p>
        </div>
      ) : (
        <ul className="list">
          {inventories.map(inv => (
            <li key={inv.id} className="list-item">
              <Link 
                to={`/lector-codigos/inventory/${inv.id}`} 
                className="list-item-content"
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div className="list-item-title">
                  Doc: {inv.documentNumber || 'Sin número'}
                </div>
                <div className="list-item-subtitle">
                  {formatDate(inv.createdAt)} · {inv.totalItems} items
                </div>
              </Link>
              <div className="list-item-actions">
                <button 
                  className="btn btn-secondary"
                  onClick={(e) => {
                    e.preventDefault()
                    handleExport(inv.id)
                  }}
                  title="Exportar"
                >
                  ↓
                </button>
                <button 
                  className="btn btn-danger"
                  onClick={(e) => {
                    e.preventDefault()
                    handleDelete(inv.id)
                  }}
                  title="Eliminar"
                >
                  ×
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* New inventory modal */}
      {showNewModal && (
        <div className="overlay" onClick={() => setShowNewModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Nueva Toma</h2>
            <div className="form-group">
              <label className="form-label">Número de Documento</label>
              <input
                type="text"
                className="form-input"
                value={newDocNumber}
                onChange={e => setNewDocNumber(e.target.value)}
                placeholder="Ej: 001"
                autoFocus
              />
            </div>
            <div className="modal-actions">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowNewModal(false)}
              >
                Cancelar
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleCreateNew}
              >
                Crear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Home
