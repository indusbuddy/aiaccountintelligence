import nodemailer from 'nodemailer';

export interface EmailDispatchResponse {
  sent: boolean;
  mode: 'sent' | 'disabled' | 'missing_credentials' | 'error';
  recipient: string;
  sender: string;
  messageId?: string;
  reason?: string;
}

export function isEmailEnabled(): boolean {
  return String(process.env.ENABLE_EMAIL_NOTIFICATIONS || 'false').toLowerCase().trim() === 'true';
}

export function getEmailConfigSummary() {
  return {
    enabled: isEmailEnabled(),
    sender: process.env.SMTP_USER || 'ecomm.indus@gmail.com',
    fromHeader: process.env.EMAIL_FROM || 'Indus Account Intelligence <ecomm.indus@gmail.com>',
    recipient: process.env.EMAIL_TEST_RECIPIENT || 'samarth.patki@indushealthplus.com',
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT || 587),
    hasPassword: Boolean(process.env.SMTP_PASS && process.env.SMTP_PASS.trim().length > 0),
  };
}

export async function sendSignalDigestEmail(params: {
  subject: string;
  text: string;
  html?: string;
}): Promise<EmailDispatchResponse> {
  const cfg = getEmailConfigSummary();

  // Master toggle check from .env
  if (!cfg.enabled) {
    console.log(
      `[Email Service] Email notifications disabled (ENABLE_EMAIL_NOTIFICATIONS=false). Dry-run prepared from ${cfg.sender} to ${cfg.recipient}.`
    );
    return {
      sent: false,
      mode: 'disabled',
      recipient: cfg.recipient,
      sender: cfg.sender,
      reason: 'Email notifications are disabled in .env (ENABLE_EMAIL_NOTIFICATIONS=false).',
    };
  }

  if (!cfg.hasPassword) {
    console.warn(
      `[Email Service] ENABLE_EMAIL_NOTIFICATIONS=true, but SMTP_PASS is empty. Skipping actual SMTP send to ${cfg.recipient}.`
    );
    return {
      sent: false,
      mode: 'missing_credentials',
      recipient: cfg.recipient,
      sender: cfg.sender,
      reason: 'SMTP_PASS is not configured in .env.',
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: cfg.host,
      port: cfg.port,
      secure: String(process.env.SMTP_SECURE || 'false').toLowerCase().trim() === 'true',
      auth: {
        user: cfg.sender,
        pass: process.env.SMTP_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: cfg.fromHeader,
      to: cfg.recipient,
      subject: params.subject,
      text: params.text,
      html: params.html || `<pre style="font-family: monospace; white-space: pre-wrap;">${params.text}</pre>`,
    });

    console.log(`[Email Service] Dispatched email (${info.messageId}) to ${cfg.recipient}`);
    return {
      sent: true,
      mode: 'sent',
      recipient: cfg.recipient,
      sender: cfg.sender,
      messageId: info.messageId,
    };
  } catch (err: any) {
    console.error('[Email Service] Failed to send email:', err?.message || err);
    return {
      sent: false,
      mode: 'error',
      recipient: cfg.recipient,
      sender: cfg.sender,
      reason: err?.message || 'Unknown SMTP error',
    };
  }
}
