'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::note.note', ({ strapi }) => ({
  async find(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const filters = { user: { documentId: user.documentId } };
    if (ctx.query.report) {
      filters.report = { documentId: ctx.query.report };
    }

    const docs = strapi.documents('api::note.note');
    const notes = await docs.findMany({
      filters,
      sort: 'createdAt:desc',
      populate: { report: { fields: ['id', 'documentId', 'title', 'slug'] } },
    });

    return ctx.send({ data: notes });
  },

  async create(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const { note_text, section_anchor, report } = ctx.request.body.data || ctx.request.body;

    const docs = strapi.documents('api::note.note');
    const note = await docs.create({
      data: { note_text, section_anchor, report, user: user.documentId },
      populate: { report: { fields: ['id', 'documentId', 'title', 'slug'] } },
    });

    return ctx.send({ data: note }, 201);
  },

  async update(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const { id } = ctx.params;
    const docs = strapi.documents('api::note.note');
    const existing = await docs.findOne({
      documentId: id,
      populate: { user: { fields: ['documentId'] } },
    });

    if (!existing || existing.user?.documentId !== user.documentId) return ctx.notFound();

    const { note_text } = ctx.request.body.data || ctx.request.body;
    const note = await docs.update({ documentId: id, data: { note_text } });

    return ctx.send({ data: note });
  },

  async delete(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const { id } = ctx.params;
    const docs = strapi.documents('api::note.note');
    const existing = await docs.findOne({
      documentId: id,
      populate: { user: { fields: ['documentId'] } },
    });

    if (!existing || existing.user?.documentId !== user.documentId) return ctx.notFound();

    await docs.delete({ documentId: id });
    return ctx.send({ data: { id } });
  },
}));
