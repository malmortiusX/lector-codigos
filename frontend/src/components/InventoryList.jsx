import { Link } from 'react-router-dom'

/**
 * Componente para mostrar lista de tomas de inventario
 */
function InventoryList({ inventories, onExport, onDelete }) {
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

  if (inventories.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📋</div>
        <p>No hay tomas de inventario</p>
        <p className="text-muted">Crea una nueva para comenzar</p>
      </div>
    )
  }

  return (
    <ul className="list">
      {inventories.map(inv => (
        <li key={inv.id} className="list-item">
          <Link 
            to={`/inventory/${inv.id}`} 
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
                onExport(inv.id)
              }}
              title="Exportar"
            >
              ↓
            </button>
            <button 
              className="btn btn-danger"
              onClick={(e) => {
                e.preventDefault()
                onDelete(inv.id)
              }}
              title="Eliminar"
            >
              ×
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}

export default InventoryList
