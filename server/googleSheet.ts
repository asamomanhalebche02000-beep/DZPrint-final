import { Order } from '../src/types';
import { Database } from './db';

/**
 * Format an order into a clean row object for Google Sheets Webhook
 */
export function formatOrderForSheet(order: Order) {
  const itemsText = (order.items || [])
    .map(
      it =>
        `${it.product_name_snapshot || (it as any).product_name || 'منتج'} [${it.size_snapshot || (it as any).size || 'M'} - ${it.color_snapshot || (it as any).color_name || 'افتراضي'}] x${it.quantity} (${it.unit_price} د.ج)`
    )
    .join(' | ');

  return {
    order_number: order.order_number,
    created_at: order.created_at || new Date().toISOString(),
    full_name: order.full_name,
    phone: order.phone,
    email: order.email || '',
    wilaya_name: order.wilaya_name || '',
    delivery_agency_name: order.delivery_agency_name || '',
    delivery_method: order.delivery_method === 'home' ? 'توصيل للمنزل' : 'استلام من المكتب',
    delivery_address: order.delivery_address || '',
    items_summary: itemsText,
    items_count: (order.items || []).reduce((sum, it) => sum + (it.quantity || 1), 0),
    subtotal: order.subtotal || 0,
    delivery_fee: order.delivery_fee || 0,
    discount: order.discount || 0,
    total: order.total || 0,
    status: order.status || 'received',
    customer_notes: order.customer_notes || '',
    timestamp: new Date().toLocaleString('ar-DZ', { timeZone: 'Africa/Algiers' }),
  };
}

/**
 * Automatically sync a single order to Google Sheets via Webhook
 */
export async function syncOrderToGoogleSheet(order: Order): Promise<boolean> {
  try {
    const settings = await Database.getSettings();
    if (!settings.google_sheet_sync_enabled || !settings.google_sheet_webhook_url) {
      return false;
    }

    const webhookUrl = settings.google_sheet_webhook_url.trim();
    if (!webhookUrl.startsWith('http')) {
      return false;
    }

    const payload = formatOrderForSheet(order);

    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      console.log(`[Google Sheet Auto-Sync]: Order ${order.order_number} synced successfully.`);
      return true;
    } else {
      console.warn(`[Google Sheet Auto-Sync]: Webhook returned status ${res.status}`);
      return false;
    }
  } catch (err: any) {
    console.error('[Google Sheet Sync Error]:', err.message);
    return false;
  }
}

/**
 * Sync multiple orders to Google Sheets via Webhook
 */
export async function syncBulkOrdersToGoogleSheet(orders: Order[]): Promise<{ success: boolean; count: number; message: string }> {
  const settings = await Database.getSettings();
  if (!settings.google_sheet_webhook_url || !settings.google_sheet_webhook_url.trim()) {
    throw new Error('يرجى حفظ رابط Webhook الخاص بـ Google Sheet أولاً في إعدادات المتجر');
  }

  const webhookUrl = settings.google_sheet_webhook_url.trim();
  const rows = orders.map(formatOrderForSheet);

  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'bulk_sync',
      orders: rows,
      synced_at: new Date().toISOString(),
    }),
  });

  if (!res.ok) {
    throw new Error(`أرجع الرابط خطأ برمز ${res.status}: ${res.statusText}`);
  }

  return {
    success: true,
    count: orders.length,
    message: `تم إرسال ${orders.length} طلبية إلى جدول Google بنجاح`,
  };
}

/**
 * Test the Google Sheet webhook with a sample order
 */
export async function testGoogleSheetWebhook(webhookUrl: string): Promise<boolean> {
  const testPayload = {
    order_number: 'TEST-0001',
    created_at: new Date().toISOString(),
    full_name: 'اختبار الاتصال بجدول Google',
    phone: '0555000000',
    email: 'test@dzprint.dz',
    wilaya_name: '16 - الجزائر (Alger)',
    delivery_agency_name: 'Yalidine Express',
    delivery_method: 'توصيل للمنزل',
    delivery_address: 'الجزائر العاصمة، تجربة الربط المباشر',
    items_summary: 'تيشيرت أسود تجريبي [L - أسود] x1 (1800 د.ج)',
    items_count: 1,
    subtotal: 1800,
    delivery_fee: 500,
    discount: 0,
    total: 2300,
    status: 'received',
    customer_notes: 'طلب تجريبي لاختبار Google Apps Script Webhook',
    timestamp: new Date().toLocaleString('ar-DZ', { timeZone: 'Africa/Algiers' }),
  };

  const res = await fetch(webhookUrl.trim(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testPayload),
  });

  if (!res.ok) {
    throw new Error(`فشل الاتصال: ${res.status} ${res.statusText}`);
  }

  return true;
}

/**
 * Generate a UTF-8 with BOM CSV string for instant drag & drop or import into Google Sheets
 */
export function generateOrdersGoogleSheetsCsv(orders: Order[]): string {
  const headers = [
    'رقم الطلب',
    'التاريخ',
    'اسم الزبون',
    'الهاتف',
    'البريد الإلكتروني',
    'الولاية',
    'شركة التوصيل',
    'نوع التوصيل',
    'العنوان',
    'المنتجات والكمية',
    'المجموع الفرعي (د.ج)',
    'سعر الشحن (د.ج)',
    'الخصم (د.ج)',
    'المجموع الإجمالي (د.ج)',
    'الحالة',
    'ملاحظات الزبون',
  ];

  const rows = orders.map(o => {
    const itemsStr = (o.items || [])
      .map(
        it =>
          `${it.product_name_snapshot || (it as any).product_name || 'منتج'} (${it.size_snapshot || (it as any).size || ''}/${it.color_snapshot || (it as any).color_name || ''}) x${it.quantity}`
      )
      .join(' ; ');

    const escapeCsv = (val: any) => {
      const str = String(val ?? '').replace(/"/g, '""');
      return `"${str}"`;
    };

    return [
      escapeCsv(o.order_number),
      escapeCsv(o.created_at ? new Date(o.created_at).toLocaleDateString('ar-DZ') : ''),
      escapeCsv(o.full_name),
      escapeCsv(`'${o.phone}`),
      escapeCsv(o.email || ''),
      escapeCsv(o.wilaya_name),
      escapeCsv(o.delivery_agency_name),
      escapeCsv(o.delivery_method === 'home' ? 'منزلي' : 'مكتب'),
      escapeCsv(o.delivery_address),
      escapeCsv(itemsStr),
      escapeCsv(o.subtotal || 0),
      escapeCsv(o.delivery_fee || 0),
      escapeCsv(o.discount || 0),
      escapeCsv(o.total || 0),
      escapeCsv(o.status),
      escapeCsv(o.customer_notes || ''),
    ].join(',');
  });

  // UTF-8 BOM for Excel and Google Sheets Arabic support
  return '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
}
