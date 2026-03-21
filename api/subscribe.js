// api/subscribe.js
// Vercel serverless function — handles waitlist signups
// • Adds email to Resend Audience
// • Sends a branded confirmation email to the subscriber

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email } = req.body ?? {};
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Server misconfiguration' });

  const headers = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };

  try {
    const audRes = await fetch('https://api.resend.com/audiences', { headers });
    const { data: audiences } = await audRes.json();
    const audienceId = audiences?.[0]?.id;

    if (audienceId) {
      await fetch(`https://api.resend.com/audiences/${audienceId}/contacts`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ email, unsubscribed: false }),
      });
    }

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        from: 'Mosaic <onboarding@resend.dev>',
        to: email,
        reply_to: 'raine5600@gmail.com',
        subject: "You're on the Mosaic waitlist 🎉",
        html: confirmationEmail(email),
      }),
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('[subscribe]', err);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}

function confirmationEmail(email) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><title>You're on the Mosaic waitlist</title></head>
<body style="margin:0;padding:0;background:#080A10;font-family:'Inter',Helvetica,Arial,sans-serif;color:#E2E6F3;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#080A10;padding:40px 16px;">
  <tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
      <tr><td align="center" style="padding-bottom:32px;">
        <table cellpadding="0" cellspacing="0"><tr>
          <td style="background:linear-gradient(135deg,#8B5CF6,#14B8A6);border-radius:16px;padding:2px;">
            <table cellpadding="0" cellspacing="0"><tr>
              <td style="background:#0C0E14;border-radius:14px;padding:12px 24px;">
                <span style="font-size:20px;font-weight:800;letter-spacing:-0.5px;background:linear-gradient(135deg,#8B5CF6,#14B8A6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">Mosaic</span>
              </td>
            </tr></table>
          </td>
        </tr></table>
      </td></tr>
      <tr><td style="background:#0C0E14;border:1px solid #252A3A;border-radius:20px;overflow:hidden;">
        <table width="100%" cellpadding="0" cellspacing="0"><tr>
          <td style="background:linear-gradient(90deg,#8B5CF6,#6C63FF,#14B8A6);height:4px;"></td>
        </tr></table>
        <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 40px 36px;">
          <tr><td align="center" style="padding-bottom:24px;">
            <div style="font-size:48px;margin-bottom:20px;">🎉</div>
            <h1 style="margin:0 0 12px;font-size:26px;font-weight:800;letter-spacing:-0.8px;color:#FFFFFF;">You're on the list!</h1>
            <p style="margin:0;font-size:16px;color:#B0B6CC;line-height:1.6;">Thanks for joining the Mosaic waitlist.<br>We'll let you know the moment the app is live.</p>
          </td></tr>
          <tr><td style="border-top:1px solid #1A1E2B;padding:0 0 28px;"></td></tr>
          <tr><td style="padding-bottom:28px;">
            <p style="margin:0 0 18px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#7A809A;">What to expect</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:14px;"><tr>
              <td width="40" valign="top"><div style="width:34px;height:34px;background:rgba(139,92,246,0.12);border-radius:8px;text-align:center;line-height:34px;font-size:16px;">🔔</div></td>
              <td style="padding-left:14px;"><p style="margin:0;font-size:14px;font-weight:600;color:#E2E6F3;">Launch notification</p><p style="margin:4px 0 0;font-size:13px;color:#7A809A;line-height:1.5;">You'll be the first to know when Mosaic hits the App Store.</p></td>
            </tr></table>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:14px;"><tr>
              <td width="40" valign="top"><div style="width:34px;height:34px;background:rgba(20,184,166,0.12);border-radius:8px;text-align:center;line-height:34px;font-size:16px;">🎁</div></td>
              <td style="padding-left:14px;"><p style="margin:0;font-size:14px;font-weight:600;color:#E2E6F3;">Early access perks</p><p style="margin:4px 0 0;font-size:13px;color:#7A809A;line-height:1.5;">Waitlist members get first access and exclusive launch pricing.</p></td>
            </tr></table>
            <table width="100%" cellpadding="0" cellspacing="0"><tr>
              <td width="40" valign="top"><div style="width:34px;height:34px;background:rgba(245,158,11,0.12);border-radius:8px;text-align:center;line-height:34px;font-size:16px;">📬</div></td>
              <td style="padding-left:14px;"><p style="margin:0;font-size:14px;font-weight:600;color:#E2E6F3;">No spam, ever</p><p style="margin:4px 0 0;font-size:13px;color:#7A809A;line-height:1.5;">We'll only email you at launch. That's it. Unsubscribe anytime.</p></td>
            </tr></table>
          </td></tr>
          <tr><td align="center" style="padding-bottom:8px;">
            <a href="https://mosaic-landing-omega.vercel.app" style="display:inline-block;background:linear-gradient(135deg,#8B5CF6,#14B8A6);color:#FFFFFF;text-decoration:none;font-size:15px;font-weight:700;padding:14px 32px;border-radius:12px;letter-spacing:-0.2px;">View the Mosaic landing page →</a>
          </td></tr>
        </table>
      </td></tr>
      <tr><td align="center" style="padding-top:28px;">
        <p style="margin:0 0 6px;font-size:12px;color:#4A5066;">© 2026 Mosaic. All rights reserved.</p>
        <p style="margin:0;font-size:12px;color:#4A5066;">You're receiving this because you signed up at <a href="https://mosaic-landing-omega.vercel.app" style="color:#7A809A;text-decoration:none;">mosaic-landing-omega.vercel.app</a></p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}
