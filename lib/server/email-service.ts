import { getCloudflareContext } from "@opennextjs/cloudflare";

type EmailEnv = {
  RESEND_API_KEY?: string;
  EMAIL_FROM?: string;
  EMAIL_REPLY_TO?: string;
  APP_BASE_URL?: string;
};

type DeliveryResult = {
  sent: boolean;
  link: string;
  id?: string;
  reason?: string;
};

function getEnv(): EmailEnv {
  const { env } = getCloudflareContext();
  return env as EmailEnv;
}

function normalizeBaseUrl(baseUrl?: string) {
  return (baseUrl || "").trim().replace(/\/$/, "");
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildAbsoluteUrl(path: string) {
  const baseUrl = normalizeBaseUrl(getEnv().APP_BASE_URL);
  return baseUrl ? `${baseUrl}${path}` : "";
}

async function sendTransactionalEmail(input: {
  to: string;
  subject: string;
  html: string;
}) {
  const env = getEnv();

  if (!env.RESEND_API_KEY || !env.EMAIL_FROM || !normalizeBaseUrl(env.APP_BASE_URL)) {
    return { sent: false, reason: "email_not_configured" };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
      "User-Agent": "towtrack/1.0"
    },
    body: JSON.stringify({
      from: env.EMAIL_FROM,
      to: [input.to],
      subject: input.subject,
      html: input.html,
      reply_to: env.EMAIL_REPLY_TO || undefined
    })
  });

  if (!response.ok) {
    const reason = await response.text();
    return { sent: false, reason };
  }

  const payload = (await response.json()) as { id?: string };
  return { sent: true, id: payload.id };
}

export async function sendInviteEmail(input: {
  to: string;
  role: string;
  property: string;
  token: string;
}): Promise<DeliveryResult> {
  const link = buildAbsoluteUrl(`/accept-invite?token=${encodeURIComponent(input.token)}`);
  if (!link) {
    return { sent: false, link, reason: "missing_base_url" };
  }

  const html = `
    <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.6;">
      <h2>TowTrack Account Invite</h2>
      <p>You have been invited to access TowTrack as <strong>${escapeHtml(input.role)}</strong>.</p>
      <p>Property assignment: <strong>${escapeHtml(input.property || "Not specified")}</strong></p>
      <p>
        <a href="${link}" style="display:inline-block;background:#10b981;color:#0f172a;padding:12px 18px;border-radius:10px;text-decoration:none;font-weight:600;">
          Accept Invite
        </a>
      </p>
      <p>If the button does not work, copy and paste this link into your browser:</p>
      <p>${escapeHtml(link)}</p>
    </div>
  `;

  const delivery = await sendTransactionalEmail({
    to: input.to,
    subject: "Your TowTrack account invite",
    html
  });

  return { ...delivery, link };
}

export async function sendPasswordResetEmail(input: {
  to: string;
  name: string;
  token: string;
}): Promise<DeliveryResult> {
  const link = buildAbsoluteUrl(`/reset-password?token=${encodeURIComponent(input.token)}`);
  if (!link) {
    return { sent: false, link, reason: "missing_base_url" };
  }

  const html = `
    <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.6;">
      <h2>TowTrack Password Reset</h2>
      <p>Hello ${escapeHtml(input.name || input.to)},</p>
      <p>We received a request to reset your TowTrack password.</p>
      <p>
        <a href="${link}" style="display:inline-block;background:#10b981;color:#0f172a;padding:12px 18px;border-radius:10px;text-decoration:none;font-weight:600;">
          Reset Password
        </a>
      </p>
      <p>If you did not request this, you can ignore this email.</p>
      <p>If the button does not work, copy and paste this link into your browser:</p>
      <p>${escapeHtml(link)}</p>
    </div>
  `;

  const delivery = await sendTransactionalEmail({
    to: input.to,
    subject: "Reset your TowTrack password",
    html
  });

  return { ...delivery, link };
}
