import { Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import Header from './components/Header'
import { useApp } from './context/AppContext'

// Lazy loading para optimizar bundle size
const Home = lazy(() => import('./pages/Home'))
const NewInventory = lazy(() => import('./pages/NewInventory'))
const Settings = lazy(() => import('./pages/Settings'))
const SyncProducts = lazy(() => import('./pages/SyncProducts'))

function App() {
  const { isOnline } = useApp()

  return (
    <div className="app">
      <Header />
      {!isOnline && (
        <div className="offline-banner">
          ⚠️ Modo offline - Los datos se guardan localmente
        </div>
      )}
      <main className="main-content">
        <Suspense fallback={<div className="loading">Cargando...</div>}>
          <Routes>
            <Route path="/lector-codigos/" element={<Home />} />
            <Route path="/lector-codigos/inventory/:id" element={<NewInventory />} />
            <Route path="/lector-codigos/inventory/new" element={<NewInventory />} />
            <Route path="/lector-codigos/settings" element={<Settings />} />
            <Route path="/lector-codigos/sync" element={<SyncProducts />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  )
}

export default App
