/**
 * Mini Calculator Component
 * Calculadora integrada en formulario de transacciones con evaluación en tiempo real
 * Diseñada para calcular montos compuestos (ej: 200+100+300=600)
 */

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MiniCalculatorProps {
  onClose: () => void;
  onUseResult: (value: number) => void;
}

/**
 * Evalúa una expresión matemática de forma segura
 * @param expression - Expresión a evaluar (ej: "200+100+300")
 * @returns Resultado numérico o NaN si hay error
 */
function evaluateExpression(expression: string): number {
  try {
    // Sanitizar: permitir solo dígitos, operadores seguros, paréntesis, punto decimal
    const sanitized = expression.replace(/[^0-9+\-*/.()]/g, "");

    if (!sanitized || sanitized.trim() === "") {
      return 0;
    }

    // Evaluar usando Function constructor (más seguro que eval)
    const result = new Function(`return ${sanitized}`)();

    // Validar que el resultado sea un número válido
    if (typeof result !== "number" || !isFinite(result)) {
      return NaN;
    }

    // Redondear a 2 decimales
    return Number(result.toFixed(2));
  } catch {
    return NaN;
  }
}

export function MiniCalculator({ onClose, onUseResult }: MiniCalculatorProps) {
  const [expression, setExpression] = useState("");
  const [currentValue, setCurrentValue] = useState("0");

  // Evaluar expresión en tiempo real
  // Si termina con operador, evaluar la expresión sin el operador final
  const fullExpression = expression + currentValue;
  const hasOperatorAtEnd = /[+\-*/%]$/.test(fullExpression);

  let result: number;
  if (hasOperatorAtEnd) {
    // Remover el operador final y evaluar lo que hay antes
    const expressionWithoutOperator = fullExpression.slice(0, -1);
    result = evaluateExpression(expressionWithoutOperator);
  } else {
    result = evaluateExpression(fullExpression);
  }

  const isValidResult = !isNaN(result) && result > 0;

  const handleNumberClick = (num: string) => {
    setCurrentValue((prev) => {
      if (prev === "0") return num;
      return prev + num;
    });
  };

  const handleOperatorClick = (operator: string) => {
    if (currentValue === "" && expression === "") return;

    // Convertir operadores visuales a operadores JavaScript
    const jsOperator = operator === "×" ? "*" : operator === "÷" ? "/" : operator;

    setExpression((prev) => prev + currentValue + jsOperator);
    setCurrentValue("");
  };

  const handleDecimalClick = () => {
    if (!currentValue.includes(".")) {
      setCurrentValue((prev) => (prev === "" ? "0." : prev + "."));
    }
  };

  const handleClearClick = () => {
    setExpression("");
    setCurrentValue("0");
  };

  const handleBackspaceClick = () => {
    setCurrentValue((prev) => {
      if (prev.length <= 1) return "0";
      return prev.slice(0, -1);
    });
  };

  const handleToggleSignClick = () => {
    setCurrentValue((prev) => {
      if (prev === "0" || prev === "") return prev;
      if (prev.startsWith("-")) return prev.slice(1);
      return "-" + prev;
    });
  };

  const handleEqualsClick = () => {
    // El "=" es solo visual, el resultado ya está calculado en tiempo real
    // Solo actualizamos el display para mostrar el resultado como valor actual
    if (!isNaN(result)) {
      setExpression("");
      setCurrentValue(result.toString());
    }
  };

  const handleUseResult = () => {
    if (isValidResult) {
      onUseResult(result);
    }
  };

  // Display: historial de expresión + resultado actual (números puros, sin formateo)
  const displayExpression = expression + currentValue;
  // Limitar a 8 decimales para evitar imprecisiones de punto flotante (0.1 + 0.2 = 0.30000000000000004)
  const displayResult = isNaN(result) ? "Error" : Number(result.toFixed(8)).toString();

  return (
    <div className="rounded-xl overflow-hidden border border-sp-blue-500/20 bg-slate-800/70 backdrop-blur-sm">
      {/* Header con botón cerrar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-700/50">
        <span className="text-xs font-medium text-slate-200">Calculadora</span>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onClose}
          className="hover:bg-slate-700/50"
        >
          <X className="h-4 w-4 text-slate-400" />
        </Button>
      </div>

      {/* Display */}
      <div className="px-4 py-3 text-right border-b border-slate-700/30">
        <p className="text-xs text-slate-400 font-mono h-4 truncate">{displayExpression || " "}</p>
        <p className="text-3xl font-bold text-slate-100 font-mono mt-1">{displayResult}</p>
      </div>

      {/* Buttons Grid 4×5 */}
      <div className="grid grid-cols-4 gap-2 p-3">
        {/* Row 1: C, +/-, %, ÷ */}
        <CalcButton onClick={handleClearClick} variant="clear">
          C
        </CalcButton>
        <CalcButton onClick={handleToggleSignClick} variant="operator">
          +/−
        </CalcButton>
        <CalcButton onClick={() => handleOperatorClick("%")} variant="operator">
          %
        </CalcButton>
        <CalcButton onClick={() => handleOperatorClick("÷")} variant="operator">
          ÷
        </CalcButton>

        {/* Row 2: 7, 8, 9, × */}
        <CalcButton onClick={() => handleNumberClick("7")}>7</CalcButton>
        <CalcButton onClick={() => handleNumberClick("8")}>8</CalcButton>
        <CalcButton onClick={() => handleNumberClick("9")}>9</CalcButton>
        <CalcButton onClick={() => handleOperatorClick("×")} variant="operator">
          ×
        </CalcButton>

        {/* Row 3: 4, 5, 6, − */}
        <CalcButton onClick={() => handleNumberClick("4")}>4</CalcButton>
        <CalcButton onClick={() => handleNumberClick("5")}>5</CalcButton>
        <CalcButton onClick={() => handleNumberClick("6")}>6</CalcButton>
        <CalcButton onClick={() => handleOperatorClick("-")} variant="operator">
          −
        </CalcButton>

        {/* Row 4: 1, 2, 3, + */}
        <CalcButton onClick={() => handleNumberClick("1")}>1</CalcButton>
        <CalcButton onClick={() => handleNumberClick("2")}>2</CalcButton>
        <CalcButton onClick={() => handleNumberClick("3")}>3</CalcButton>
        <CalcButton onClick={() => handleOperatorClick("+")} variant="operator">
          +
        </CalcButton>

        {/* Row 5: ., 0, ⌫, = */}
        <CalcButton onClick={handleDecimalClick} variant="operator">
          .
        </CalcButton>
        <CalcButton onClick={() => handleNumberClick("0")}>0</CalcButton>
        <CalcButton onClick={handleBackspaceClick} variant="operator">
          ⌫
        </CalcButton>
        <CalcButton onClick={handleEqualsClick} variant="accent">
          =
        </CalcButton>
      </div>

      {/* Use Result Button */}
      <div className="px-3 pb-3">
        <Button
          type="button"
          variant="success"
          className="w-full"
          disabled={!isValidResult}
          onClick={handleUseResult}
        >
          ✓ Usar resultado: {isValidResult ? Number(result.toFixed(8)).toString() : "0"}
        </Button>
      </div>
    </div>
  );
}

/**
 * Botón de calculadora con variantes de estilo
 */
interface CalcButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: "base" | "operator" | "clear" | "accent";
}

function CalcButton({ children, onClick, variant = "base" }: CalcButtonProps) {
  const baseStyles = "h-12 rounded-lg font-semibold transition-all duration-150 active:scale-95";

  const variantStyles = {
    base: "bg-slate-700/40 hover:bg-slate-700/60 text-slate-100 text-lg",
    operator: "bg-slate-700/30 hover:bg-slate-700/50 text-sp-blue-400 text-base",
    clear: "bg-red-500/20 hover:bg-red-500/30 text-red-400 text-base",
    accent: "bg-sp-blue-600/30 hover:bg-sp-blue-600/40 text-sp-blue-300 text-lg font-bold",
  };

  return (
    <button type="button" onClick={onClick} className={cn(baseStyles, variantStyles[variant])}>
      {children}
    </button>
  );
}
