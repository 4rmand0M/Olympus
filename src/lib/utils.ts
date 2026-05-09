import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string, moneda: string = 'RD$') {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return `RD$ 0.00`;
  
  // Limpiamos la moneda de cualquier caracter extraño (solo permitimos letras y $)
  let cleanMoneda = (moneda || 'RD$').replace(/[^\w$]/g, '').trim();
  if (!cleanMoneda) cleanMoneda = 'RD$';
  
  // Usamos en-US para asegurar comas como separador de miles y punto para decimales
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
  
  return `${cleanMoneda} ${formatted}`;
}

export function formatNumber(amount: number | string) {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return "0";
  return new Intl.NumberFormat('en-US').format(num);
}

// Formateadores manuales para evitar caracteres invisibles de toLocaleString
export function formatDate(date: string | Date) {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '—';
  
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  
  return `${day}/${month}/${year}`;
}

export function formatTime(date: string | Date) {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '—';
  
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // el 0 debe ser 12
  
  return `${hours}:${minutes} ${ampm}`;
}
