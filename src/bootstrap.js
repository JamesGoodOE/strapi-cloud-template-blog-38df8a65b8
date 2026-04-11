'use strict';

/**
 * Bootstrap function — runs on Strapi startup.
 * Creates the oe_admin and oe_subscriber roles if they don't exist.
 */
module.exports = async ({ strapi }) => {
  const roles = await strapi
    .query('plugin::users-permissions.role')
    .findMany();

  const roleTypes = roles.map((r) => r.type);

  if (!roleTypes.includes('oe_admin')) {
    await strapi.query('plugin::users-permissions.role').create({
      data: {
        name: 'OE Admin',
        description: 'Full access to all reports and admin features',
        type: 'oe_admin',
      },
    });
    strapi.log.info('Created oe_admin role');
  }

  if (!roleTypes.includes('oe_subscriber')) {
    await strapi.query('plugin::users-permissions.role').create({
      data: {
        name: 'OE Subscriber',
        description: 'Authenticated subscriber with permission-code access',
        type: 'oe_subscriber',
      },
    });
    strapi.log.info('Created oe_subscriber role');
  }

  // Set default role for new registrations (including Auth0 auto-created users)
  // to oe_subscriber so they get permission-code gated access.
  const subscriberRole = await strapi.query('plugin::users-permissions.role').findOne({
    where: { type: 'oe_subscriber' },
  });
  if (subscriberRole) {
    const pluginStore = strapi.store({ type: 'plugin', name: 'users-permissions' });
    const advancedSettings = await pluginStore.get({ key: 'advanced' });
    if (advancedSettings && advancedSettings.default_role !== subscriberRole.id) {
      await pluginStore.set({
        key: 'advanced',
        value: { ...advancedSettings, default_role: subscriberRole.id },
      });
      strapi.log.info(`Set default registration role to oe_subscriber (id: ${subscriberRole.id})`);
    }
  }
};
