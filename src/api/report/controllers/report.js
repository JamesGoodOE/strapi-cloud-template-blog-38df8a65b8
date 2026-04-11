'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::report.report', ({ strapi }) => ({
  /**
   * GET /api/reports/catalogue
   * Catalogue search with filters and permission-aware results.
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
   * GET /api/reports/:id
   * Override findOne to increment view count.
   */
  async findOne(ctx) {
    const { id } = ctx.params;

    // Increment view count (fire-and-forget)
    strapi.service('api::report.report').incrementViewCount(id);

    // Use default core findOne
    return await super.findOne(ctx);
  },
}));
