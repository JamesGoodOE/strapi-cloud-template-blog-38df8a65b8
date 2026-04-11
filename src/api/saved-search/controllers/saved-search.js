'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::saved-search.saved-search', ({ strapi }) => ({
  async find(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const docs = strapi.documents('api::saved-search.saved-search');
    const searches = await docs.findMany({
      filters: { user: { documentId: user.documentId } },
      sort: 'createdAt:desc',
    });

    return ctx.send({ data: searches });
  },

  async create(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const { name, query_params, notify_on_new } = ctx.request.body.data || ctx.request.body;

    const docs = strapi.documents('api::saved-search.saved-search');
    const search = await docs.create({
      data: { name, query_params, notify_on_new: notify_on_new || false, user: user.documentId },
    });

    return ctx.send({ data: search }, 201);
  },

  async update(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const { id } = ctx.params;
    const docs = strapi.documents('api::saved-search.saved-search');
    const existing = await docs.findOne({
      documentId: id,
      populate: { user: { fields: ['documentId'] } },
    });

    if (!existing || existing.user?.documentId !== user.documentId) return ctx.notFound();

    const { name, notify_on_new } = ctx.request.body.data || ctx.request.body;
    const search = await docs.update({ documentId: id, data: { name, notify_on_new } });

    return ctx.send({ data: search });
  },

  async delete(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const { id } = ctx.params;
    const docs = strapi.documents('api::saved-search.saved-search');
    const existing = await docs.findOne({
      documentId: id,
      populate: { user: { fields: ['documentId'] } },
    });

    if (!existing || existing.user?.documentId !== user.documentId) return ctx.notFound();

    await docs.delete({ documentId: id });
    return ctx.send({ data: { id } });
  },
}));
