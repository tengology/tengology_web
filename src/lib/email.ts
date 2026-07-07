import { Resend } from "resend";
import {
  orderConfirmationHtml,
  shippingNotificationHtml,
  passwordResetHtml,
  type OrderEmailItem,
  type OrderEmailAddress,
} from "./email-templates";

const globalForResend = globalThis as unknown as {
  resend: Resend | undefined;
};

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

function fromAddress(): string {
  return process.env.EMAIL_FROM ?? "Tengology <onboarding@resend.dev>";
}

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  /** Short plain-text summary shown in the dev log when emails aren't configured. */
  devSummary?: string;
}

/**
 * Sends an email via Resend. When RESEND_API_KEY is unset, logs the email
 * to the server console instead. Never throws — callers (checkout, order
 * fulfilment) must not fail because an email couldn't be sent.
 */
export async function sendEmail({
  to,
  subject,
  html,
  devSummary,
}: SendEmailParams): Promise<{ skipped: boolean }> {
  if (!isEmailConfigured()) {
    console.log(
      `[email:dev] RESEND_API_KEY not set — email NOT sent\n` +
        `  to:      ${to}\n` +
        `  subject: ${subject}` +
        (devSummary ? `\n  ${devSummary}` : "")
    );
    return { skipped: true };
  }

  try {
    if (!globalForResend.resend) {
      globalForResend.resend = new Resend(process.env.RESEND_API_KEY);
    }
    const { error } = await globalForResend.resend.emails.send({
      from: fromAddress(),
      to,
      subject,
      html,
    });
    if (error) {
      console.error("[email] Resend returned an error:", error);
    }
  } catch (err) {
    console.error("[email] Failed to send:", err);
  }
  return { skipped: false };
}

export async function sendOrderConfirmationEmail(params: {
  to: string;
  orderNumber: string;
  items: OrderEmailItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  shippingAddress: OrderEmailAddress;
  lookupUrl: string;
}) {
  return sendEmail({
    to: params.to,
    subject: `Your Tengology order ${params.orderNumber} is confirmed`,
    html: orderConfirmationHtml(params),
    devSummary: `lookup: ${params.lookupUrl}`,
  });
}

export async function sendShippingNotificationEmail(params: {
  to: string;
  orderNumber: string;
  carrier?: string | null;
  trackingNumber?: string | null;
  lookupUrl: string;
}) {
  return sendEmail({
    to: params.to,
    subject: `Your Tengology order ${params.orderNumber} has shipped`,
    html: shippingNotificationHtml(params),
    devSummary: `tracking: ${params.carrier ?? "-"} ${params.trackingNumber ?? ""}`,
  });
}

export async function sendPasswordResetEmail(params: {
  to: string;
  resetUrl: string;
}) {
  return sendEmail({
    to: params.to,
    subject: "Reset your Tengology password",
    html: passwordResetHtml({ resetUrl: params.resetUrl }),
    devSummary: `reset url: ${params.resetUrl}`,
  });
}
