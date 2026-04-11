'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::custom-report.custom-report', ({ strapi }) => ({
  async find(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const scope = ctx.query.scope || 'all';
    const userDocs = strapi.documents('plugin::users-permissions.user');
    const fullUser = await userDocs.findOne({
      documentId: user.documentId,
      fields: ['org_id', 'email'],
    });
    const orgId = fullUser?.org_id || fullUser?.email?.split('@')[1] || null;

    let filters;
    if (scope === 'mine') {
      filters = { user: { documentId: user.documentId } };
    } else if (scope === 'shared') {
      filters = {
        is_shared: true,
        org_id: orgId,
        user: { documentId: { $ne: user.documentId } },
      };
    } else {
      filters = {
        $or: [
          { user: { documentId: user.documentId } },
          { is_shared: true, org_id: orgId },
        ],
      };
    }

    const docs = strapi.documents('api::custom-report.custom-report');
    const reports = await docs.findMany({
      filters,
      sort: 'updatedAt:desc',
      populate: {
        user: { fields: ['documentId', 'username', 'first_name', 'last_name'] },
        clippings: {
          populate: { report: { fields: ['id', 'documentId', 'title'] } },
        },
      },
    });

    return ctx.send({ data: reports });
  },

  async findOne(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const { id } = ctx.params;
    const docs = strapi.documents('api::custom-report.custom-report');
    const report = await docs.findOne({
      documentId: id,
      populate: {
        user: { fields: ['documentId', 'username', 'first_name', 'last_name', 'org_id', 'email'] },
        clippings: {
          sort: 'sort_order:asc',
          populate: { report: { fields: ['id', 'documentId', 'title', 'slug'] } },
        },
      },
    });

    if (!report) return ctx.notFound();

    if (report.user?.documentId !== user.documentId) {
      if (!report.is_shared) return ctx.notFound();
      const userDocs = strapi.documents('plugin::users-permissions.user');
      const fullUser = await userDocs.findOne({
        documentId: user.documentId,
        fields: ['org_id', 'email'],
      });
      const userOrg = fullUser?.org_id || fullUser?.email?.split('@')[1];
      if (report.org_id !== userOrg) return ctx.notFound();
    }

    return ctx.send({ data: report });
  },

  async create(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const { title, description, clippings } = ctx.request.body.data || ctx.request.body;

    const docs = strapi.documents('api::custom-report.custom-report');
    const report = await docs.create({
      data: {
        title,
        description,
        user: user.documentId,
        clippings: clippings || [],
        is_shared: false,
      },
    });

    return ctx.send({ data: report }, 201);
  },

  async update(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const { id } = ctx.params;
    const docs = strapi.documents('api::custom-report.custom-report');
    const existing = await docs.findOne({
      documentId: id,
      populate: { user: { fields: ['documentId'] } },
    });

    if (!existing || existing.user?.documentId !== user.documentId) return ctx.notFound();

    const { title, description, clippings } = ctx.request.body.data || ctx.request.body;
    const report = await docs.update({ documentId: id, data: { title, description, clippings } });

    return ctx.send({ data: report });
  },

  async delete(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const { id } = ctx.params;
    const docs = strapi.documents('api::custom-report.custom-report');
    const existing = await docs.findOne({
      documentId: id,
      populate: { user: { fields: ['documentId'] } },
    });

    if (!existing || existing.user?.documentId !== user.documentId) return ctx.notFound();

    await docs.delete({ documentId: id });
    return ctx.send({ data: { id } });
  },

  async share(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const { id } = ctx.params;
    const docs = strapi.documents('api::custom-report.custom-report');
    const existing = await docs.findOne({
      documentId: id,
      populate: { user: { fields: ['documentId'] } },
    });

    if (!existing || existing.user?.documentId !== user.documentId) return ctx.notFound();

    const userDocs = strapi.documents('plugin::users-permissions.user');
    const fullUser = await userDocs.findOne({
      documentId: user.documentId,
      fields: ['org_id', 'email'],
    });

    const orgId = fullUser?.org_id || fullUser?.email?.split('@')[1] || null;
    const newShared = !existing.is_shared;

    const report = await docs.update({
      documentId: id,
      data: { is_shared: newShared, org_id: newShared ? orgId : null },
    });

    return ctx.send({ data: report });
  },
}));
