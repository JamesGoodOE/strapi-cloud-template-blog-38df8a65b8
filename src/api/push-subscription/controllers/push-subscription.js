'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::push-subscription.push-subscription', ({ strapi }) => ({
  async create(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const { endpoint, keys } = ctx.request.body.data || ctx.request.body;
    if (!endpoint || !keys) return ctx.badRequest('endpoint and keys required');

    // Check if already exists
    const docs = strapi.documents('api::push-subscription.push-subscription');
    const existing = await docs.findMany({
      filters: { endpoint },
      limit: 1,
    });

    if (existing.length > 0) {
      return ctx.send({ data: existing[0] });
    }

    const sub = await docs.create({
      data: { endpoint, keys, user: user.documentId },
    });

    return ctx.send({ data: sub }, 201);
  },

  async delete(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const { endpoint } = ctx.request.body?.data || ctx.request.body || {};
    if (!endpoint) return ctx.badRequest('endpoint required');

    const docs = strapi.documents('api::push-subscription.push-subscription');
    const existing = await docs.findMany({
      filters: { endpoint },
      limit: 1,
    });

    if (existing.length > 0) {
      await docs.delete({ documentId: existing[0].documentId });
    }

    return ctx.send({ data: { ok: true } });
  },
}));
