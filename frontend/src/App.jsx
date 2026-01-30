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
            <Route path="/" element={<Home />} />
            <Route path="/inventory/:id" element={<NewInventory />} />
            <Route path="/inventory/new" element={<NewInventory />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/sync" element={<SyncProducts />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  )
}

export default App
