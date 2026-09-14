export function formatPrice(amount: number, currency: string = 'DA'): string {
  return `${amount.toLocaleString()} ${currency}`;
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function sanitizePhone(phone: string): string {
  return phone.replace(/[^0-9]/g, '');
}
