# Lector de Códigos - PWA de Inventarios

PWA optimizada para pistola láser Zebra MC930B con Android 8.1.0, diseñada para gestión de inventarios con soporte offline-first.

## Estructura del Proyecto

```
lector-codigos/
├── frontend/          # React + Vite PWA
├── backend/           # Node.js + Express API
└── README.md
```

## Requisitos

- Node.js 18+
- SQL Server (para sincronización de productos)

## Instalación

### Backend

```bash
cd backend
npm install
npm run dev
```

El servidor se ejecutará en `http://localhost:3001`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

La aplicación se ejecutará en `http://localhost:5173`

## Configuración

1. Abrir la aplicación en el navegador
2. Ir a **Configuración** e ingresar los datos del servidor SQL Server
3. Probar la conexión
4. Ir a **Actualizar Productos** para sincronizar la base de datos local

## Uso

1. Crear una nueva toma de inventario desde la pantalla principal
2. Escanear códigos de barras con el lector láser
3. Los códigos se parsean automáticamente y se muestran con información del producto
4. Exportar la toma a archivo TXT cuando esté completa

## Estructura del Código de Barras

```
"90" + CodigoProducto(10) + Peso(4,2) + Unidades(4,2) + Lote(5) + Consecutivo(10)
```

## Características

- PWA con soporte offline completo
- Service Workers para cache de assets
- IndexedDB para almacenamiento local
- UI optimizada para dispositivos industriales
- Exportación a archivo TXT
