import { Resend } from 'resend';
import { Order } from '../src/types';

let resendClient: Resend | null = null;

function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey.includes('placeholder')) {
    return null;
  }
  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

export async function sendOrderNotificationEmails(order: Order): Promise<{
  adminEmailSent: boolean;
  customerEmailSent: boolean;
  errors?: string[];
}> {
  const resend = getResendClient();
  const adminEmail = process.env.ADMIN_EMAIL || 'orders@dzprint.dz';
  const fromEmail = process.env.FROM_EMAIL || 'DZPrint <orders@resend.dev>';
  const errors: string[] = [];

  // Always log clear audit output for container & serverless logs
  console.log(`[Order Processing #${order.order_number}] Initiating email dispatch:`, {
    adminEmail,
    customerEmail: order.email || 'None',
    total: `${order.total} DA`,
    wilaya: order.wilaya_name,
    agency: order.delivery_agency_name,
  });

  if (!resend) {
    console.warn(
      '[EMAIL SERVICE WARNING]: RESEND_API_KEY is not configured in .env. Email dispatch simulated. To send real production emails, set RESEND_API_KEY in environment variables.'
    );
    return { adminEmailSent: false, customerEmailSent: false, errors: ['RESEND_API_KEY not configured'] };
  }

  let adminEmailSent = false;
  let customerEmailSent = false;

  // 1. Send Admin / Store notification email
  try {
    const itemsListHtml = (order.items || [])
      .map(
        item => `
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 10px; font-weight: bold;">${item.product_name_snapshot}</td>
          <td style="padding: 10px;">${item.color_snapshot} / ${item.size_snapshot}</td>
          <td style="padding: 10px; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px; text-align: left; font-weight: bold;">${item.unit_price * item.quantity} DA</td>
        </tr>
        ${
          item.uploaded_design_url
            ? `<tr><td colspan="4" style="padding: 4px 10px 10px; font-size: 11px; color: #2563eb;">تصميم العميل المرفوع: <a href="${item.uploaded_design_url}" target="_blank">معاينة وتنزيل ملف التصميم</a></td></tr>`
            : ''
        }
      `
      )
      .join('');

    const adminHtml = `
      <div dir="rtl" style="font-family: Arial, sans-serif; background-color: #f8fafc; padding: 24px; color: #1e293b;">
        <div style="max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <div style="background: #f59e0b; padding: 20px 24px; text-align: right;">
            <h1 style="margin: 0; color: #ffffff; font-size: 20px;">🎉 طلب جديد وارد: ${order.order_number}</h1>
            <p style="margin: 4px 0 0; color: #fffbeb; font-size: 13px;">المبلغ الإجمالي: <strong>${order.total} د.ج</strong> (الدفع عند الاستلام)</p>
          </div>
          <div style="padding: 24px;">
            <h2 style="font-size: 16px; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px; margin-top: 0;">معلومات العميل والشحن</h2>
            <ul style="list-style: none; padding: 0; line-height: 1.8; font-size: 13px;">
              <li><strong>الاسم واللقب:</strong> ${order.full_name}</li>
              <li><strong>الهاتف:</strong> <a href="tel:${order.phone}">${order.phone}</a></li>
              ${order.email ? `<li><strong>البريد الإلكتروني:</strong> ${order.email}</li>` : ''}
              <li><strong>الولاية:</strong> ${order.wilaya_name}</li>
              <li><strong>شركة التوصيل:</strong> ${order.delivery_agency_name} (${order.delivery_method === 'home' ? 'توصيل للمنزل' : 'استلام من المكتب'})</li>
              <li><strong>العنوان:</strong> ${order.delivery_address}</li>
              ${order.customer_notes ? `<li><strong>ملاحظات العميل:</strong> <span style="color: #b45309;">${order.customer_notes}</span></li>` : ''}
            </ul>

            <h2 style="font-size: 16px; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px; margin-top: 24px;">تفاصيل المشتريات</h2>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 8px;">
              <thead>
                <tr style="background: #f8fafc; text-align: right;">
                  <th style="padding: 8px 10px;">المنتج</th>
                  <th style="padding: 8px 10px;">المواصفات</th>
                  <th style="padding: 8px 10px; text-align: center;">الكمية</th>
                  <th style="padding: 8px 10px; text-align: left;">المجموع</th>
                </tr>
              </thead>
              <tbody>
                ${itemsListHtml}
              </tbody>
            </table>

            <div style="margin-top: 20px; padding: 16px; background: #fffbeb; border-radius: 10px; font-size: 13px;">
              <p style="margin: 0; display: flex; justify-content: space-between;"><span>المجموع الفرعي:</span> <strong>${order.subtotal} DA</strong></p>
              <p style="margin: 4px 0 0; display: flex; justify-content: space-between;"><span>رسوم التوصيل:</span> <strong>+${order.delivery_fee} DA</strong></p>
              ${order.discount ? `<p style="margin: 4px 0 0; color: #16a34a; display: flex; justify-content: space-between;"><span>الخصم (كوبون ${order.coupon_code}):</span> <strong>-${order.discount} DA</strong></p>` : ''}
              <div style="border-top: 1px dashed #fcd34d; margin-top: 8px; padding-top: 8px; font-size: 16px; font-weight: bold; color: #b45309;">
                المبلغ النهائي المطلوب تحصيله: ${order.total} د.ج
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    const adminResult = await resend.emails.send({
      from: fromEmail,
      to: adminEmail,
      subject: `🚨 طلب جديد #${order.order_number} - ${order.full_name} (${order.total} DA)`,
      html: adminHtml,
    });

    if (adminResult.error) {
      console.error('[Resend Admin Email Error]:', adminResult.error);
      errors.push(`Admin email failed: ${adminResult.error.message}`);
    } else {
      adminEmailSent = true;
      console.log(`[Resend Admin Email Success]: ID ${adminResult.data?.id}`);
    }
  } catch (err: any) {
    console.error('[Resend Admin Email Exception]:', err);
    errors.push(err.message);
  }

  // 2. Send Customer confirmation email if email provided
  if (order.email && order.email.includes('@')) {
    try {
      const customerHtml = `
        <div dir="rtl" style="font-family: Arial, sans-serif; background-color: #f8fafc; padding: 24px; color: #1e293b;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0;">
            <div style="background: #111827; padding: 24px; text-align: center; color: #ffffff;">
              <h1 style="margin: 0; font-size: 22px; color: #f59e0b;">ديزاد برينت | DZPrint</h1>
              <p style="margin: 6px 0 0; color: #94a3b8; font-size: 14px;">شكراً لتسوقك معنا! تم تسجيل طلبك بنجاح</p>
            </div>
            <div style="padding: 24px;">
              <p style="font-size: 14px; line-height: 1.6;">
                مرحباً <strong>${order.full_name}</strong>،<br />
                نشكرك على ثقتك في ديزاد برينت للطباعة المخصصة. تم استلام طلبك رقم <strong>${order.order_number}</strong> وسيتصل بك أحد ممثلي خدمة العملاء هاتفياً لتأكيد التفاصيل وتجهيز الطباعة.
              </p>
              <div style="background: #f1f5f9; padding: 16px; border-radius: 12px; margin: 16px 0; font-size: 13px; line-height: 1.8;">
                <div><strong>رقم الطلب:</strong> ${order.order_number}</div>
                <div><strong>الولاية:</strong> ${order.wilaya_name}</div>
                <div><strong>شركة الشحن:</strong> ${order.delivery_agency_name} (${order.delivery_method === 'home' ? 'توصيل للمنزل' : 'استلام من المكتب'})</div>
                <div><strong>المبلغ الإجمالي عند الاستلام:</strong> <span style="font-size: 16px; color: #f59e0b; font-weight: bold;">${order.total} د.ج</span></div>
              </div>
              <p style="font-size: 12px; color: #64748b; text-align: center; margin-top: 24px;">
                يمكنك متابعة حالة طلبك في أي وقت عبر موقعنا باستخدام رقم الطلب ورقم هاتفك.<br />
                لأي استفسار، تواصل معنا عبر الهاتف: 0550 12 34 56
              </p>
            </div>
          </div>
        </div>
      `;

      const custResult = await resend.emails.send({
        from: fromEmail,
        to: order.email,
        subject: `تأكيد استلام طلبك من ديزاد برينت #${order.order_number}`,
        html: customerHtml,
      });

      if (custResult.error) {
        console.error('[Resend Customer Email Error]:', custResult.error);
        errors.push(`Customer email failed: ${custResult.error.message}`);
      } else {
        customerEmailSent = true;
        console.log(`[Resend Customer Email Success]: ID ${custResult.data?.id}`);
      }
    } catch (err: any) {
      console.error('[Resend Customer Email Exception]:', err);
      errors.push(err.message);
    }
  }

  return {
    adminEmailSent,
    customerEmailSent,
    errors: errors.length > 0 ? errors : undefined,
  };
}
