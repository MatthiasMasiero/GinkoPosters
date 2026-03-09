import asyncio
import logging

import resend

from src.config import settings
from src.orders.models import Order

logger = logging.getLogger(__name__)

resend.api_key = settings.RESEND_API_KEY


def _render_order_confirmation(order: Order) -> str:
    items_rows = ""
    for item in order.items:
        items_rows += (
            f"<tr>"
            f"<td style='padding:8px 12px;border-bottom:1px solid #eee;'>"
            f"Poster — {item.variant.size if hasattr(item, 'variant') and item.variant else 'N/A'}</td>"
            f"<td style='padding:8px 12px;border-bottom:1px solid #eee;text-align:center;'>{item.quantity}</td>"
            f"<td style='padding:8px 12px;border-bottom:1px solid #eee;text-align:right;'>€{float(item.unit_price):.2f}</td>"
            f"</tr>"
        )

    address_line2 = f"<br>{order.shipping_address_line2}" if order.shipping_address_line2 else ""
    state_part = f"{order.shipping_state}, " if order.shipping_state else ""

    return f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f5f5f5;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;padding:40px 30px;">
    <h1 style="margin:0 0 8px;font-size:24px;color:#1A1A2E;">Ginko Posters</h1>
    <p style="margin:0 0 30px;color:#666;font-size:14px;">Order Confirmation</p>

    <p style="color:#333;">Hi {order.customer_name},</p>
    <p style="color:#333;">Thank you for your order! We've received it and will begin processing shortly.</p>

    <div style="background:#f9f9f9;border-radius:8px;padding:16px 12px;margin:24px 0;">
      <p style="margin:0 0 4px;font-size:13px;color:#888;">Order Number</p>
      <p style="margin:0;font-size:18px;font-weight:600;color:#1A1A2E;">{order.order_number}</p>
    </div>

    <table style="width:100%;border-collapse:collapse;margin:24px 0;">
      <thead>
        <tr style="background:#f5f5f5;">
          <th style="padding:8px 12px;text-align:left;font-size:13px;color:#888;">Item</th>
          <th style="padding:8px 12px;text-align:center;font-size:13px;color:#888;">Qty</th>
          <th style="padding:8px 12px;text-align:right;font-size:13px;color:#888;">Price</th>
        </tr>
      </thead>
      <tbody>
        {items_rows}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="2" style="padding:12px;text-align:right;color:#666;">Subtotal</td>
          <td style="padding:12px;text-align:right;color:#666;">€{float(order.subtotal):.2f}</td>
        </tr>
        {"" if float(order.discount) == 0 else f'''<tr>
          <td colspan="2" style="padding:4px 12px 12px;text-align:right;color:#c0392b;">Multi-item discount (15%)</td>
          <td style="padding:4px 12px 12px;text-align:right;color:#c0392b;">-€{float(order.discount):.2f}</td>
        </tr>'''}
        <tr>
          <td colspan="2" style="padding:12px;text-align:right;font-weight:600;border-top:2px solid #333;">Total</td>
          <td style="padding:12px;text-align:right;font-weight:600;border-top:2px solid #333;">€{float(order.subtotal) - float(order.discount):.2f}</td>
        </tr>
      </tfoot>
    </table>

    <div style="margin:24px 0;">
      <p style="margin:0 0 4px;font-size:13px;color:#888;">Shipping Address</p>
      <p style="margin:0;color:#333;">
        {order.customer_name}<br>
        {order.shipping_address_line1}{address_line2}<br>
        {order.shipping_city}, {state_part}{order.shipping_postal_code}<br>
        {order.shipping_country}
      </p>
    </div>

    <p style="color:#888;font-size:13px;margin-top:40px;">If you have any questions, reply to this email or visit our support page.</p>
    <p style="color:#aaa;font-size:12px;">© Ginko Posters</p>
  </div>
</body>
</html>"""


def _render_shipping_notification(order: Order) -> str:
    address_line2 = f"<br>{order.shipping_address_line2}" if order.shipping_address_line2 else ""
    state_part = f"{order.shipping_state}, " if order.shipping_state else ""

    return f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f5f5f5;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;padding:40px 30px;">
    <h1 style="margin:0 0 8px;font-size:24px;color:#1A1A2E;">Ginko Posters</h1>
    <p style="margin:0 0 30px;color:#666;font-size:14px;">Shipping Update</p>

    <p style="color:#333;">Hi {order.customer_name},</p>
    <p style="color:#333;">Great news — your order <strong>{order.order_number}</strong> has been shipped!</p>

    <div style="margin:24px 0;">
      <p style="margin:0 0 4px;font-size:13px;color:#888;">Shipping To</p>
      <p style="margin:0;color:#333;">
        {order.customer_name}<br>
        {order.shipping_address_line1}{address_line2}<br>
        {order.shipping_city}, {state_part}{order.shipping_postal_code}<br>
        {order.shipping_country}
      </p>
    </div>

    <p style="color:#333;">You'll receive your poster(s) within the standard delivery window. We hope you love them!</p>

    <p style="color:#888;font-size:13px;margin-top:40px;">If you have any questions, reply to this email or visit our support page.</p>
    <p style="color:#aaa;font-size:12px;">© Ginko Posters</p>
  </div>
</body>
</html>"""


def _send_email(to: str, subject: str, html: str) -> None:
    """Synchronous email send — intended to be called via asyncio.to_thread."""
    resend.Emails.send({
        "from": settings.FROM_EMAIL,
        "to": [to],
        "subject": subject,
        "html": html,
    })


async def send_order_confirmation(order: Order) -> None:
    try:
        html = _render_order_confirmation(order)
        await asyncio.to_thread(
            _send_email,
            order.customer_email,
            f"Order Confirmed — {order.order_number}",
            html,
        )
        logger.info("Order confirmation email sent for %s", order.order_number)
    except Exception:
        logger.exception("Failed to send order confirmation email for %s", order.order_number)


async def send_shipping_notification(order: Order) -> None:
    try:
        html = _render_shipping_notification(order)
        await asyncio.to_thread(
            _send_email,
            order.customer_email,
            f"Your Order Has Shipped — {order.order_number}",
            html,
        )
        logger.info("Shipping notification email sent for %s", order.order_number)
    except Exception:
        logger.exception("Failed to send shipping notification email for %s", order.order_number)
