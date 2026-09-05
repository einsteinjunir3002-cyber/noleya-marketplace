export function formatGHS(amount?: number): string {
  if (!amount || Number(amount) <= 0) {
    return 'Price on Request';
  }
  return `GH₵ ${Number(amount).toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatGhanaPhone(phone: string): string {
  const clean = phone.replace(/[^0-9]/g, '');
  if (clean.length === 10 && clean.startsWith('0')) {
    return `${clean.slice(0, 3)} ${clean.slice(3, 6)} ${clean.slice(6)}`;
  }
  return phone;
}

export function sanitizeWhatsAppPhone(phone: string): string {
  let clean = phone.replace(/[^0-9]/g, '');
  if (clean.startsWith('0') && clean.length === 10) {
    clean = '233' + clean.slice(1);
  } else if (!clean.startsWith('233') && clean.length === 9) {
    clean = '233' + clean;
  }
  return clean;
}

export function buildWhatsAppUrl(phone: string, productName: string, priceGhs?: number, productUrl?: string): string {
  const cleanPhone = sanitizeWhatsAppPhone(phone);
  const priceText = priceGhs && Number(priceGhs) > 0 ? ` (${formatGHS(priceGhs)})` : '';
  const message = `Hello, I am interested in inquiring about "${productName}"${priceText} listed on Noléya Marketplace.${productUrl ? ` Link: ${productUrl}` : ''} Please share pricing, product availability, and delivery options.`;
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
