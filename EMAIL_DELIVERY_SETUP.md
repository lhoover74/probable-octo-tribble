TowTrack Email Delivery Setup

TowTrack now supports sending real invite and password reset emails through Resend.

Required configuration
- RESEND_API_KEY (secret)
- EMAIL_FROM (for example: TowTrack <no-reply@yourdomain.com>)
- APP_BASE_URL (for example: https://towtrack.example.com)
- EMAIL_REPLY_TO (optional)

Cloudflare notes
- Store RESEND_API_KEY as a secret, not a plaintext variable.
- EMAIL_FROM and APP_BASE_URL can be plain environment variables if preferred.
- In local development, use .dev.vars or .env files and do not commit them.

Example values
EMAIL_FROM="TowTrack <no-reply@yourdomain.com>"
APP_BASE_URL="https://towtrack.example.com"
EMAIL_REPLY_TO="support@yourdomain.com"

What happens if email is not configured
- Invite creation still works
- Password reset token generation still works
- The UI falls back to showing a manual link you can copy

Recommended setup flow
1. Verify your sending domain in Resend.
2. Add RESEND_API_KEY as a Cloudflare secret.
3. Add APP_BASE_URL and EMAIL_FROM in Cloudflare variables.
4. Redeploy the Worker.
5. Test invite delivery from /cf/admin/access.
6. Test password reset delivery from /reset-password.
