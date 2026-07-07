import { formatPrice } from "./format";

const INK = "#1A1714";
const MOSS = "#4A5D43";
const STONE = "#EDEAE3";
const BACKGROUND = "#FCFBF8";

function shell(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:${BACKGROUND};color:${INK};font-family:Georgia,'Times New Roman',serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BACKGROUND};padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
          <tr>
            <td style="padding-bottom:28px;border-bottom:1px solid ${STONE};" align="center">
              <span style="font-size:26px;letter-spacing:0.18em;text-transform:uppercase;color:${INK};">Tengology</span>
              <p style="margin:8px 0 0;font-family:Helvetica,Arial,sans-serif;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#8a847c;">Handmade in Oxford</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 8px;">
              ${body}
            </td>
          </tr>
          <tr>
            <td style="padding-top:24px;border-top:1px solid ${STONE};" align="center">
              <p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:11px;letter-spacing:0.08em;color:#8a847c;">
                Tengology — handcrafted accessories &amp; crystal jewellery<br />
                Made by hand in Oxford, United Kingdom
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function button(href: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px auto;">
    <tr>
      <td style="background-color:${INK};">
        <a href="${href}" style="display:inline-block;padding:14px 32px;font-family:Helvetica,Arial,sans-serif;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:${BACKGROUND};text-decoration:none;">${label}</a>
      </td>
    </tr>
  </table>`;
}

export interface OrderEmailItem {
  title: string;
  quantity: number;
  totalPrice: number;
}

export interface OrderEmailAddress {
  firstName: string;
  lastName: string;
  line1: string;
  line2?: string | null;
  city: string;
  county?: string | null;
  postcode: string;
}

export function orderConfirmationHtml(params: {
  orderNumber: string;
  items: OrderEmailItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  shippingAddress: OrderEmailAddress;
  lookupUrl: string;
}): string {
  const { orderNumber, items, subtotal, shippingCost, total, shippingAddress, lookupUrl } = params;

  const rows = items
    .map(
      (item) => `<tr>
        <td style="padding:10px 0;border-bottom:1px solid ${STONE};font-size:15px;">${item.title} <span style="color:#8a847c;">× ${item.quantity}</span></td>
        <td style="padding:10px 0;border-bottom:1px solid ${STONE};font-family:Helvetica,Arial,sans-serif;font-size:14px;" align="right">${formatPrice(item.totalPrice)}</td>
      </tr>`
    )
    .join("");

  const address = [
    `${shippingAddress.firstName} ${shippingAddress.lastName}`,
    shippingAddress.line1,
    shippingAddress.line2,
    shippingAddress.city,
    shippingAddress.county,
    shippingAddress.postcode,
  ]
    .filter(Boolean)
    .join("<br />");

  const body = `
    <h1 style="margin:0 0 8px;font-size:28px;font-weight:normal;">Thank you for your order</h1>
    <p style="margin:0 0 24px;font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:1.6;color:#55504a;">
      Your order <strong style="color:${INK};">${orderNumber}</strong> has been received.
      Each Tengology piece is made by hand, and yours is being prepared with care.
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      ${rows}
      <tr>
        <td style="padding:10px 0;font-family:Helvetica,Arial,sans-serif;font-size:13px;color:#55504a;">Subtotal</td>
        <td style="padding:10px 0;font-family:Helvetica,Arial,sans-serif;font-size:13px;" align="right">${formatPrice(subtotal)}</td>
      </tr>
      <tr>
        <td style="padding:2px 0;font-family:Helvetica,Arial,sans-serif;font-size:13px;color:#55504a;">Shipping</td>
        <td style="padding:2px 0;font-family:Helvetica,Arial,sans-serif;font-size:13px;" align="right">${shippingCost === 0 ? "Free" : formatPrice(shippingCost)}</td>
      </tr>
      <tr>
        <td style="padding:12px 0;border-top:1px solid ${INK};font-size:16px;">Total</td>
        <td style="padding:12px 0;border-top:1px solid ${INK};font-family:Helvetica,Arial,sans-serif;font-size:16px;" align="right"><strong>${formatPrice(total)}</strong></td>
      </tr>
    </table>
    <h2 style="margin:28px 0 8px;font-size:18px;font-weight:normal;">Delivering to</h2>
    <p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:1.7;color:#55504a;">${address}</p>
    ${button(lookupUrl, "Track your order")}
    <p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:12px;line-height:1.6;color:#8a847c;">
      Questions about your order? Just reply to this email.
    </p>`;

  return shell(`Order ${orderNumber} confirmed`, body);
}

export function shippingNotificationHtml(params: {
  orderNumber: string;
  carrier?: string | null;
  trackingNumber?: string | null;
  lookupUrl: string;
}): string {
  const { orderNumber, carrier, trackingNumber, lookupUrl } = params;

  const trackingBlock =
    carrier || trackingNumber
      ? `<p style="margin:0 0 4px;font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#55504a;">
          ${carrier ? `Carrier: <strong style="color:${INK};">${carrier}</strong><br />` : ""}
          ${trackingNumber ? `Tracking number: <strong style="color:${INK};">${trackingNumber}</strong>` : ""}
        </p>`
      : "";

  const body = `
    <h1 style="margin:0 0 8px;font-size:28px;font-weight:normal;">Your order is on its way</h1>
    <p style="margin:0 0 20px;font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:1.6;color:#55504a;">
      Order <strong style="color:${INK};">${orderNumber}</strong> has been carefully
      packed and posted.
    </p>
    ${trackingBlock}
    ${button(lookupUrl, "View your order")}
    <p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:12px;line-height:1.6;color:#8a847c;">
      Thank you for supporting small-batch handmade work.
    </p>`;

  return shell(`Order ${orderNumber} shipped`, body);
}

export function passwordResetHtml(params: { resetUrl: string }): string {
  const body = `
    <h1 style="margin:0 0 8px;font-size:28px;font-weight:normal;">Reset your password</h1>
    <p style="margin:0 0 8px;font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:1.6;color:#55504a;">
      We received a request to reset the password for your Tengology account.
      This link is valid for one hour and can be used once.
    </p>
    ${button(params.resetUrl, "Choose a new password")}
    <p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:12px;line-height:1.6;color:#8a847c;">
      If you didn't request this, you can safely ignore this email — your
      password will stay as it is.
    </p>`;

  return shell("Reset your Tengology password", body);
}

export { MOSS as EMAIL_ACCENT_COLOR };
