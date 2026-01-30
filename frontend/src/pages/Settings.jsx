import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { testConnection } from '../services/api'

function Settings() {
  const { config, saveConfig } = useApp()
  const [formData, setFormData] = useState({
    server: '',
    port: '1433',
    database: '',
    user: '',
    password: '',
    trustServerCertificate: true
  })
  const [testing, setTesting] = useState(false)
  const [message, setMessage] = useState(null)
  const [saved, setSaved] = useState(false)

  // Cargar configuración existente
  useEffect(() => {
    if (config) {
      setFormData({
        server: config.server || '',
        port: config.port || '1433',
        database: config.database || '',
        user: config.user || '',
        password: config.password || '',
        trustServerCertificate: config.trustServerCertificate !== false
      })
    }
  }, [config])

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    setSaved(false)
  }

  async function handleTestConnection() {
    setTesting(true)
    setMessage(null)

    const result = await testConnection(formData)
    
    setTesting(false)
    setMessage({
      type: result.success ? 'success' : 'error',
      text: result.message
    })
  }

  async function handleSave() {
    const success = await saveConfig(formData)
    
    if (success) {
      setSaved(true)
      setMessage({ type: 'success', text: 'Configuración guardada' })
    } else {
      setMessage({ type: 'error', text: 'Error al guardar' })
    }
  }

  return (
    <div className="settings-page">
      <div className="card">
        <h2 className="card-title">Servidor SQL Server</h2>
        <p className="card-subtitle mb-lg">
          Configura la conexión al servidor de base de datos
        </p>

        <div className="form-group">
          <label className="form-label">Servidor</label>
          <input
            type="text"
            name="server"
            className="form-input"
            value={formData.server}
            onChange={handleChange}
            placeholder="Ej: 192.168.1.100 o servidor.local"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Puerto</label>
          <input
            type="text"
            name="port"
            className="form-input"
            value={formData.port}
            onChange={handleChange}
            placeholder="1433"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Base de Datos</label>
          <input
            type="text"
            name="database"
            className="form-input"
            value={formData.database}
            onChange={handleChange}
            placeholder="Nombre de la base de datos"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Usuario</label>
          <input
            type="text"
            name="user"
            className="form-input"
            value={formData.user}
            onChange={handleChange}
            placeholder="Usuario de SQL Server"
            autoComplete="username"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Contraseña</label>
          <input
            type="password"
            name="password"
            className="form-input"
            value={formData.password}
            onChange={handleChange}
            placeholder="Contraseña"
            autoComplete="current-password"
          />
        </div>

        <div className="form-group">
          <label className="form-checkbox">
            <input
              type="checkbox"
              name="trustServerCertificate"
              checked={formData.trustServerCertificate}
              onChange={handleChange}
            />
            <span>Confiar en certificado del servidor</span>
          </label>
        </div>

        {message && (
          <div className={`message message-${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="action-bar">
          <button 
            className="btn btn-secondary"
            onClick={handleTestConnection}
            disabled={testing || !formData.server || !formData.database}
          >
            {testing ? 'Probando...' : 'Probar Conexión'}
          </button>
          <button 
            className="btn btn-primary"
            onClick={handleSave}
            disabled={!formData.server || !formData.database}
          >
            {saved ? '✓ Guardado' : 'Guardar'}
          </button>
        </div>
      </div>

      <div className="card mt-md">
        <h3 className="card-title">Información</h3>
        <p className="text-muted">
          La configuración se guarda localmente en el dispositivo.
          No es necesario reingresarla cada vez que uses la aplicación.
        </p>
        <p className="text-muted mt-md">
          Asegúrate de tener conexión de red al servidor SQL Server
          para probar la conexión y sincronizar productos.
        </p>
      </div>
    </div>
  )
}

export default Settings
