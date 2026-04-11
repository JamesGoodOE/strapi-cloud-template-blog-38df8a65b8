'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::clipping.clipping', ({ strapi }) => ({
  async find(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const docs = strapi.documents('api::clipping.clipping');
    const clippings = await docs.findMany({
      filters: { user: { documentId: user.documentId } },
      sort: 'sort_order:asc',
      populate: {
        report: { fields: ['id', 'documentId', 'title', 'slug'] },
      },
    });

    return ctx.send({ data: clippings });
  },

  async create(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const { section_anchor, section_title, section_html, report } = ctx.request.body.data || ctx.request.body;

    const docs = strapi.documents('api::clipping.clipping');
    const clipping = await docs.create({
      data: {
        section_anchor,
        section_title,
        section_html,
        report,
        user: user.documentId,
        sort_order: 0,
      },
      populate: { report: { fields: ['id', 'documentId', 'title', 'slug'] } },
    });

    return ctx.send({ data: clipping }, 201);
  },

  async delete(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const { id } = ctx.params;
    const docs = strapi.documents('api::clipping.clipping');
    const clipping = await docs.findOne({
      documentId: id,
      populate: { user: { fields: ['documentId'] } },
    });

    if (!clipping || clipping.user?.documentId !== user.documentId) {
      return ctx.notFound();
    }

    await docs.delete({ documentId: id });
    return ctx.send({ data: { id } });
  },

  async reorder(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const { ids } = ctx.request.body.data || ctx.request.body;
    if (!Array.isArray(ids)) return ctx.badRequest('ids must be an array');

    const docs = strapi.documents('api::clipping.clipping');
    await Promise.all(
      ids.map((docId, index) =>
        docs.update({ documentId: docId, data: { sort_order: index } })
      )
    );

    return ctx.send({ data: { reordered: ids.length } });
  },

  async clearAll(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const docs = strapi.documents('api::clipping.clipping');
    const clippings = await docs.findMany({
      filters: { user: { documentId: user.documentId } },
      fields: ['documentId'],
    });

    await Promise.all(
      clippings.map((c) => docs.delete({ documentId: c.documentId }))
    );

    return ctx.send({ data: { deleted: clippings.length } });
  },
}));
