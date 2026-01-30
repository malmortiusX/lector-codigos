import { useState, useCallback, useRef, useEffect } from 'react'
import { parseBarcode } from '../services/barcodeParser'
import { addInventoryItem, getProductByCode } from '../services/db'

/**
 * Hook para manejar la lectura de códigos de barras
 * @param {number} inventoryId - ID del inventario activo
 * @param {Function} onScan - Callback cuando se escanea un código
 */
export function useBarcode(inventoryId, onScan) {
  const [inputValue, setInputValue] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [lastError, setLastError] = useState(null)
  const inputRef = useRef(null)
  const processingTimeout = useRef(null)

  // Mantener el input enfocado
  useEffect(() => {
    const focusInput = () => {
      if (inputRef.current && !isProcessing) {
        inputRef.current.focus()
      }
    }

    // Enfocar inicialmente
    focusInput()

    // Re-enfocar cuando se pierde el foco
    const handleFocusOut = () => {
      setTimeout(focusInput, 100)
    }

    const input = inputRef.current
    if (input) {
      input.addEventListener('blur', handleFocusOut)
    }

    return () => {
      if (input) {
        input.removeEventListener('blur', handleFocusOut)
      }
    }
  }, [isProcessing])

  // Procesar código de barras
  const processBarcode = useCallback(async (code) => {
    if (!code || isProcessing) return

    setIsProcessing(true)
    setLastError(null)

    try {
      // Parsear el código
      const parsed = parseBarcode(code)

      if (!parsed.valid) {
        setLastError(parsed.error)
        if (onScan) {
          onScan({ success: false, error: parsed.error, rawBarcode: code })
        }
        return
      }

      // Buscar información del producto
      let productInfo = null
      try {
        productInfo = await getProductByCode(parsed.productCode)
      } catch (e) {
        // Continuar sin información del producto
      }

      // Guardar en la base de datos
      if (inventoryId) {
        await addInventoryItem(inventoryId, {
          rawBarcode: parsed.rawBarcode,
          productCode: parsed.productCode,
          weight: parsed.weight,
          units: parsed.units,
          batch: parsed.batch,
          consecutive: parsed.consecutive
        })
      }

      // Notificar éxito
      if (onScan) {
        onScan({
          success: true,
          parsed,
          product: productInfo
        })
      }
    } catch (error) {
      setLastError(error.message)
      if (onScan) {
        onScan({ success: false, error: error.message, rawBarcode: code })
      }
    } finally {
      setIsProcessing(false)
      setInputValue('')
      
      // Re-enfocar el input
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus()
        }
      }, 50)
    }
  }, [inventoryId, isProcessing, onScan])

  // Manejar cambio de input
  const handleInputChange = useCallback((e) => {
    const value = e.target.value
    setInputValue(value)

    // Limpiar timeout anterior
    if (processingTimeout.current) {
      clearTimeout(processingTimeout.current)
    }

    // Los lectores láser envían el código completo seguido de Enter o Tab
    // También podemos detectar por longitud (39 caracteres)
    if (value.length >= 39) {
      processingTimeout.current = setTimeout(() => {
        processBarcode(value)
      }, 100)
    }
  }, [processBarcode])

  // Manejar teclas especiales (Enter, Tab)
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault()
      if (inputValue.length > 0) {
        processBarcode(inputValue)
      }
    }
  }, [inputValue, processBarcode])

  // Forzar enfoque del input
  const focusInput = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  return {
    inputRef,
    inputValue,
    isProcessing,
    lastError,
    handleInputChange,
    handleKeyDown,
    focusInput,
    clearError: () => setLastError(null)
  }
}
