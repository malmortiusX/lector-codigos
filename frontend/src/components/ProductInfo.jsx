import { formatWeight, formatUnits } from '../services/barcodeParser'

/**
 * Componente para mostrar información de un producto escaneado
 */
function ProductInfo({ item, index, total }) {
  function formatItemCode(code) {
    return code.replace(/^0+/, '') || '0'
  }

  return (
    <div className={`scanned-item ${item.error ? 'error' : ''}`}>
      <div className="scanned-item-code">
        #{total - index} · {item.rawBarcode}
      </div>
      <div className="scanned-item-product">
        {item.productDescription || `Producto: ${formatItemCode(item.productCode)}`}
      </div>
      <div className="scanned-item-details">
        Peso: {formatWeight(item.weight)} · 
        Unidades: {formatUnits(item.units)} · 
        Lote: {item.batch}
      </div>
    </div>
  )
}

export default ProductInfo
