/**
 * Componente de formulario para configuración de SQL Server
 */
function ConfigForm({ formData, onChange, onTest, onSave, testing, saved }) {
  return (
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
          onChange={onChange}
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
          onChange={onChange}
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
          onChange={onChange}
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
          onChange={onChange}
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
          onChange={onChange}
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
            onChange={onChange}
          />
          <span>Confiar en certificado del servidor</span>
        </label>
      </div>

      <div className="action-bar">
        <button 
          className="btn btn-secondary"
          onClick={onTest}
          disabled={testing || !formData.server || !formData.database}
        >
          {testing ? 'Probando...' : 'Probar Conexión'}
        </button>
        <button 
          className="btn btn-primary"
          onClick={onSave}
          disabled={!formData.server || !formData.database}
        >
          {saved ? '✓ Guardado' : 'Guardar'}
        </button>
      </div>
    </div>
  )
}

export default ConfigForm
