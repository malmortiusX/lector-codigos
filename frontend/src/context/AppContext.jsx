import { createContext, useContext, useState, useEffect } from 'react'
import { db } from '../services/db'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [config, setConfig] = useState(null)
  const [productsCount, setProductsCount] = useState(0)
  const [lastSync, setLastSync] = useState(null)
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  // Cargar configuración al iniciar
  useEffect(() => {
    loadConfig()
    loadProductsInfo()

    // Listener para estado de conexión
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  async function loadConfig() {
    try {
      const savedConfig = await db.config.get('sqlserver')
      if (savedConfig) {
        setConfig(savedConfig)
      }
    } catch (error) {
      console.error('Error cargando configuración:', error)
    }
  }

  async function loadProductsInfo() {
    try {
      const count = await db.products.count()
      setProductsCount(count)

      const syncInfo = await db.config.get('lastSync')
      if (syncInfo) {
        setLastSync(new Date(syncInfo.value))
      }
    } catch (error) {
      console.error('Error cargando info de productos:', error)
    }
  }

  async function saveConfig(newConfig) {
    try {
      await db.config.put({ ...newConfig, id: 'sqlserver' })
      setConfig(newConfig)
      return true
    } catch (error) {
      console.error('Error guardando configuración:', error)
      return false
    }
  }

  async function updateProductsInfo() {
    await loadProductsInfo()
  }

  const value = {
    config,
    saveConfig,
    productsCount,
    lastSync,
    isOnline,
    updateProductsInfo
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp debe usarse dentro de AppProvider')
  }
  return context
}
