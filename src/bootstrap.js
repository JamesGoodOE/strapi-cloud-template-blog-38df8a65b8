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
};
