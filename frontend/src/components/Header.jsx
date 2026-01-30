import { Link, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'

function Header() {
  const location = useLocation()
  const { isOnline } = useApp()

  const getTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Inventarios'
      case '/inventory/new':
        return 'Nueva Toma'
      case '/settings':
        return 'Configuración'
      case '/sync':
        return 'Sincronizar'
      default:
        if (location.pathname.startsWith('/inventory/')) {
          return 'Toma de Inventario'
        }
        return 'Inventarios'
    }
  }

  const showBackButton = location.pathname !== '/'

  return (
    <header className="header">
      <div className="header-left">
        {showBackButton && (
          <Link to="/" className="btn-back">
            ← Volver
          </Link>
        )}
      </div>
      <h1 className="header-title">{getTitle()}</h1>
      <div className="header-right">
        <span className={`status-indicator ${isOnline ? 'online' : 'offline'}`}>
          {isOnline ? '●' : '○'}
        </span>
      </div>
    </header>
  )
}

export default Header
