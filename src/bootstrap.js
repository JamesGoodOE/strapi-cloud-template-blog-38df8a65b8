'use strict';

/**
 * Bootstrap — runs on every Strapi startup.
 * Creates roles, sets default role, and ensures permissions are always correct.
 */
module.exports = async ({ strapi }) => {
  // --- 1. Ensure custom roles exist ---
  const roles = await strapi.query('plugin::users-permissions.role').findMany();
  const roleTypes = roles.map((r) => r.type);

  if (!roleTypes.includes('oe_admin')) {
    await strapi.query('plugin::users-permissions.role').create({
      data: { name: 'OE Admin', description: 'Full access to all reports and admin features', type: 'oe_admin' },
    });
    strapi.log.info('Created oe_admin role');
  }

  if (!roleTypes.includes('oe_subscriber')) {
    await strapi.query('plugin::users-permissions.role').create({
      data: { name: 'OE Subscriber', description: 'Authenticated subscriber with permission-code access', type: 'oe_subscriber' },
    });
    strapi.log.info('Created oe_subscriber role');
  }

  // --- 2. Set default registration role to oe_subscriber ---
  const subscriberRole = await strapi.query('plugin::users-permissions.role').findOne({ where: { type: 'oe_subscriber' } });
  if (subscriberRole) {
    const pluginStore = strapi.store({ type: 'plugin', name: 'users-permissions' });
    const advancedSettings = await pluginStore.get({ key: 'advanced' });
    if (advancedSettings && advancedSettings.default_role !== subscriberRole.id) {
      await pluginStore.set({ key: 'advanced', value: { ...advancedSettings, default_role: subscriberRole.id } });
      strapi.log.info('Set default role to oe_subscriber');
    }
  }

  // --- 3. Auto-apply role permissions on every startup ---
  // This prevents permissions from resetting when schema changes are deployed.
  const adminRole = await strapi.query('plugin::users-permissions.role').findOne({ where: { type: 'oe_admin' } });
  const subRole = subscriberRole;

  if (adminRole) {
    await setRolePermissions(strapi, adminRole.id, buildAdminPermissions());
    strapi.log.info('Applied oe_admin permissions');
  }
  if (subRole) {
    await setRolePermissions(strapi, subRole.id, buildSubscriberPermissions());
    strapi.log.info('Applied oe_subscriber permissions');
  }

  // --- 4. Grant public access to magic-link auth endpoints ---
  const publicRole = await strapi.query('plugin::users-permissions.role').findOne({ where: { type: 'public' } });
  if (publicRole) {
    await setRolePermissions(strapi, publicRole.id, buildPublicPermissions());
    strapi.log.info('Applied public permissions (magic-link auth)');
  }
};

async function setRolePermissions(strapi, roleId, permissions) {
  const pluginService = strapi.plugin('users-permissions').service('role');
  // Fetch current role to get existing permissions structure
  const role = await pluginService.findOne(roleId);
  if (!role) return;

  // Merge our desired permissions into the existing structure
  const merged = { ...role.permissions };
  for (const [apiKey, apiPerms] of Object.entries(permissions)) {
    if (!merged[apiKey]) merged[apiKey] = { controllers: {} };
    for (const [ctrlKey, actions] of Object.entries(apiPerms.controllers)) {
      if (!merged[apiKey].controllers[ctrlKey]) merged[apiKey].controllers[ctrlKey] = {};
      for (const [action, config] of Object.entries(actions)) {
        merged[apiKey].controllers[ctrlKey][action] = config;
      }
    }
  }

  await pluginService.updateRole(roleId, { permissions: merged });
}

function buildAdminPermissions() {
  const full = (actions) => {
    const obj = {};
    actions.forEach((a) => { obj[a] = { enabled: true }; });
    return obj;
  };
  const crud = full(['find', 'findOne', 'create', 'update', 'delete']);
  const read = full(['find', 'findOne']);

  return {
    'api::report': { controllers: { report: { ...crud, catalogue: { enabled: true } } } },
    'api::region': { controllers: { region: crud } },
    'api::product': { controllers: { product: crud } },
    'api::content-type-tag': { controllers: { 'content-type-tag': crud } },
    'api::key-theme': { controllers: { 'key-theme': crud } },
    'api::search-tag': { controllers: { 'search-tag': crud } },
    'api::analyst': { controllers: { analyst: crud } },
    'api::permission-code': { controllers: { 'permission-code': crud } },
    'api::account-manager': { controllers: { 'account-manager': crud } },
    'api::account': { controllers: { account: crud } },
    'api::clipping': { controllers: { clipping: full(['find', 'create', 'delete', 'reorder', 'clearAll']) } },
    'api::note': { controllers: { note: full(['find', 'create', 'update', 'delete']) } },
    'api::saved-search': { controllers: { 'saved-search': full(['find', 'create', 'update', 'delete']) } },
    'api::custom-report': { controllers: { 'custom-report': { ...crud, share: { enabled: true } } } },
    'api::nav-category': { controllers: { 'nav-category': crud } },
    'api::push-subscription': { controllers: { 'push-subscription': full(['create', 'delete']) } },
    'plugin::users-permissions': {
      controllers: {
        user: full(['me', 'find', 'findOne', 'create', 'update', 'destroy', 'count']),
        auth: full(['changePassword', 'logout']),
        role: read,
      },
    },
  };
}

function buildPublicPermissions() {
  const full = (actions) => {
    const obj = {};
    actions.forEach((a) => { obj[a] = { enabled: true }; });
    return obj;
  };

  return {
    'api::magic-auth': { controllers: { 'magic-auth': full(['requestLink', 'verifyLink']) } },
  };
}

function buildSubscriberPermissions() {
  const full = (actions) => {
    const obj = {};
    actions.forEach((a) => { obj[a] = { enabled: true }; });
    return obj;
  };
  const read = full(['find', 'findOne']);

  return {
    'api::report': { controllers: { report: { ...read, catalogue: { enabled: true } } } },
    'api::region': { controllers: { region: read } },
    'api::product': { controllers: { product: read } },
    'api::content-type-tag': { controllers: { 'content-type-tag': read } },
    'api::key-theme': { controllers: { 'key-theme': read } },
    'api::search-tag': { controllers: { 'search-tag': read } },
    'api::analyst': { controllers: { analyst: read } },
    'api::permission-code': { controllers: { 'permission-code': read } },
    'api::account-manager': { controllers: { 'account-manager': read } },
    'api::account': { controllers: { account: read } },
    'api::clipping': { controllers: { clipping: full(['find', 'create', 'delete', 'reorder', 'clearAll']) } },
    'api::note': { controllers: { note: full(['find', 'create', 'update', 'delete']) } },
    'api::saved-search': { controllers: { 'saved-search': full(['find', 'create', 'update', 'delete']) } },
    'api::custom-report': { controllers: { 'custom-report': { ...read, create: { enabled: true }, update: { enabled: true }, delete: { enabled: true }, share: { enabled: true } } } },
    'api::nav-category': { controllers: { 'nav-category': read } },
    'api::push-subscription': { controllers: { 'push-subscription': full(['create', 'delete']) } },
    'plugin::users-permissions': {
      controllers: {
        user: full(['me', 'update']),
        auth: full(['changePassword', 'logout']),
      },
    },
  };
}
