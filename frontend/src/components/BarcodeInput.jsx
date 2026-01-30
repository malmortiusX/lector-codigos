import { forwardRef } from 'react'

/**
 * Componente de input optimizado para lectura de códigos de barras
 * con pistola láser
 */
const BarcodeInput = forwardRef(function BarcodeInput(
  { value, onChange, onKeyDown, disabled, placeholder },
  ref
) {
  return (
    <div className="barcode-input-container">
      <input
        ref={ref}
        type="text"
        className="form-input barcode-input"
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder={placeholder || 'Escanear código...'}
        disabled={disabled}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
        inputMode="none"
      />
    </div>
  )
})

export default BarcodeInput
