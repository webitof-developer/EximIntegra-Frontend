/**
 * EximIntegra Formatters
 * Dedicated formatters for HS Codes, Tariffs, Currencies, and Numbers.
 */

export function formatHsCode(code: string | undefined | null): string {
  if (!code) return "—";
  const clean = code.replace(/\D/g, "");
  if (clean.length === 8) {
    return `${clean.slice(0, 4)}.${clean.slice(4, 6)}.${clean.slice(6, 8)}`;
  }
  if (clean.length === 6) {
    return `${clean.slice(0, 4)}.${clean.slice(4, 6)}`;
  }
  if (clean.length === 4) {
    return clean;
  }
  return code;
}

export function formatCurrency(
  amount: number | undefined | null,
  currency: string = "INR",
  decimals: number = 2
): string {
  if (amount === undefined || amount === null || isNaN(amount)) return "—";
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency,
      maximumFractionDigits: decimals,
      minimumFractionDigits: decimals,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(decimals)}`;
  }
}

export function formatPercent(
  val: number | undefined | null,
  decimals: number = 2
): string {
  if (val === undefined || val === null || isNaN(val)) return "—";
  return `${val.toFixed(decimals)}%`;
}

export function formatNumber(
  val: number | undefined | null,
  decimals: number = 0
): string {
  if (val === undefined || val === null || isNaN(val)) return "—";
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: decimals,
  }).format(val);
}
