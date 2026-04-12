'use strict';

const crypto = require('crypto');
const { createCoreController } = require('@strapi/strapi').factories;

// In-memory token store for magic link auth
const magicTokens = new Map();

setInterval(() => {
  const now = Date.now();
  for (const [key, val] of magicTokens) {
    if (val.expiresAt < now) magicTokens.delete(key);
  }
}, 5 * 60 * 1000);

module.exports = createCoreController('api::report.report', ({ strapi }) => ({
  /**
   * GET /api/reports/catalogue
   */
  async catalogue(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in');

    const result = await strapi
      .service('api::report.report')
      .catalogueSearch(ctx.query, user);

    return ctx.send(result);
  },

  /**
   * GET /api/reports/:id — override to increment view count.
   */
  async findOne(ctx) {
    const { id } = ctx.params;
    strapi.service('api::report.report').incrementViewCount(id);
    return await super.findOne(ctx);
  },

  /**
   * POST /api/reports/request-magic-link
   */
  async requestMagicLink(ctx) {
    const { email } = ctx.request.body || {};

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return ctx.send({ message: 'If an account exists, a sign-in link has been sent.' });
    }

    const normalisedEmail = email.toLowerCase().trim();

    const existingUser = await strapi
      .query('plugin::users-permissions.user')
      .findOne({ where: { email: normalisedEmail } });

    if (!existingUser) {
      strapi.log.info(`Magic link requested for unknown email: ${normalisedEmail}`);
      return ctx.send({ message: 'If an account exists, a sign-in link has been sent.' });
    }

    const token = `${crypto.randomUUID()}-${crypto.randomUUID()}`;
    magicTokens.set(token, { email: normalisedEmail, expiresAt: Date.now() + 15 * 60 * 1000, used: false });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const link = `${frontendUrl}/verify?token=${token}`;

    try {
      await sendMagicLinkEmail(normalisedEmail, link);
      strapi.log.info(`Magic link sent to ${normalisedEmail}`);
    } catch (err) {
      strapi.log.error('Failed to send magic link email:', err);
    }

    return ctx.send({ message: 'If an account exists, a sign-in link has been sent.' });
  },

  /**
   * POST /api/reports/verify-magic-link
   */
  async verifyMagicLink(ctx) {
    const { token } = ctx.request.body || {};

    if (!token) {
      return ctx.badRequest('Token is required');
    }

    const record = magicTokens.get(token);

    if (!record) {
      return ctx.unauthorized('Invalid or expired link');
    }

    if (record.used) {
      return ctx.unauthorized('This link has already been used');
    }

    if (record.expiresAt < Date.now()) {
      magicTokens.delete(token);
      return ctx.unauthorized('This link has expired');
    }

    record.used = true;

    const user = await strapi
      .query('plugin::users-permissions.user')
      .findOne({
        where: { email: record.email },
        populate: ['role'],
      });

    if (!user) {
      return ctx.unauthorized('User not found');
    }

    const jwt = strapi.plugin('users-permissions').service('jwt').issue({
      id: user.id,
    });

    return ctx.send({ jwt, user: { id: user.id, email: user.email } });
  },
}));

async function sendMagicLinkEmail(email, link) {
  const host = process.env.SMTP_HOST;

  if (!host) {
    console.log('');
    console.log('==================================================');
    console.log('  MAGIC LINK (dev mode - no SMTP configured)');
    console.log('--------------------------------------------------');
    console.log(`  Email: ${email}`);
    console.log(`  Link:  ${link}`);
    console.log('==================================================');
    console.log('');
    return;
  }

  const nodemailer = require('nodemailer');

  const transporter = nodemailer.createTransport({
    host,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'noreply@oxfordeconomics.com',
    to: email,
    subject: 'My Oxford — Your sign-in link',
    html: `
      <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <div style="background: #1d2e52; padding: 24px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 600;">Oxford Economics</h1>
          <p style="color: #8ba3cc; margin: 4px 0 0; font-size: 13px;">My Oxford</p>
        </div>
        <div style="border: 1px solid #dce2eb; border-top: none; border-radius: 0 0 8px 8px; padding: 32px;">
          <p style="color: #1e2533; font-size: 15px; line-height: 1.6;">
            Click the button below to sign in to My Oxford. This link expires in <strong>15 minutes</strong>.
          </p>
          <div style="text-align: center; margin: 28px 0;">
            <a href="${link}"
               style="background: #2a5fa5; color: #ffffff; padding: 12px 32px; border-radius: 6px;
                      text-decoration: none; font-weight: 600; font-size: 15px; display: inline-block;">
              Sign In
            </a>
          </div>
          <p style="color: #5a6577; font-size: 12px; line-height: 1.5;">
            If you didn't request this link, you can safely ignore this email.<br/>
            Link: <a href="${link}" style="color: #2a5fa5; word-break: break-all;">${link}</a>
          </p>
        </div>
      </div>
    `,
    text: `Sign in to My Oxford:\n\n${link}\n\nThis link expires in 15 minutes. If you didn't request this, ignore this email.`,
  });
}
