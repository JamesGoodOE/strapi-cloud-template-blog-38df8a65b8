'use strict';

/**
 * Report lifecycle hook — sends push notifications when a report is published.
 */
module.exports = {
  async afterUpdate(event) {
    const { result } = event;

    // Only fire when publishedAt transitions from null to a value
    if (!result.publishedAt) return;

    // Check if this is a fresh publish (not just an edit of already-published)
    const previousData = event.params?.data;
    if (!previousData) return;

    try {
      const webpush = require('web-push');

      const vapidPublic = process.env.VAPID_PUBLIC_KEY;
      const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
      const vapidEmail = process.env.VAPID_EMAIL || 'mailto:support@oxfordeconomics.com';

      if (!vapidPublic || !vapidPrivate) {
        strapi.log.warn('Push: VAPID keys not configured, skipping notifications');
        return;
      }

      webpush.setVapidDetails(vapidEmail, vapidPublic, vapidPrivate);

      // Get all push subscriptions
      const subs = await strapi.documents('api::push-subscription.push-subscription').findMany({
        limit: 10000,
      });

      if (!subs.length) return;

      const payload = JSON.stringify({
        title: 'New Research Published',
        body: result.title,
        tag: `report-${result.documentId}`,
        url: `/reports/${result.documentId}`,
      });

      strapi.log.info(`Push: Sending to ${subs.length} subscribers for "${result.title}"`);

      const results = await Promise.allSettled(
        subs.map(async (sub) => {
          try {
            const keys = JSON.parse(sub.keys);
            await webpush.sendNotification(
              { endpoint: sub.endpoint, keys },
              payload
            );
          } catch (err) {
            // Remove expired/invalid subscriptions
            if (err.statusCode === 410 || err.statusCode === 404) {
              await strapi.documents('api::push-subscription.push-subscription').delete({
                documentId: sub.documentId,
              });
            }
          }
        })
      );

      const sent = results.filter((r) => r.status === 'fulfilled').length;
      strapi.log.info(`Push: ${sent}/${subs.length} notifications sent`);
    } catch (err) {
      strapi.log.error('Push notification error:', err.message);
    }
  },
};
