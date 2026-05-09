import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string, moneda: string = 'RD$') {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return `${moneda} 0.00`;
  
  // Usamos en-US para asegurar comas como separador de miles y punto para decimales
  // Evitamos el espacio de no-ruptura (\u00A0) que a veces causa el símbolo ¿
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
  
  return `${moneda} ${formatted}`;
}

export function formatNumber(amount: number | string) {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return "0";
  
  return new Intl.NumberFormat('en-US').format(num);
}
