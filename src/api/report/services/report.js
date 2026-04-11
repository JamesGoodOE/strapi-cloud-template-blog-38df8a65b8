'use strict';

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::report.report', ({ strapi }) => ({
  /**
   * Search the catalogue with filters and permission enforcement.
   * Uses Strapi v5 Document Service API.
   */
  async catalogueSearch(params, user) {
    const {
      q,
      region,
      product,
      content_type,
      key_theme,
      search_tag,
      analyst,
      date_from,
      date_to,
      sort = 'publication_date:desc',
      scope = 'all',
      page = 1,
      per_page = 20,
    } = params;

    const filters = {
      report_status: 'active',
    };

    if (q) {
      filters.$or = [
        { title: { $containsi: q } },
        { excerpt: { $containsi: q } },
        { content: { $containsi: q } },
      ];
    }

    if (date_from) {
      filters.publication_date = { ...(filters.publication_date || {}), $gte: date_from };
    }
    if (date_to) {
      filters.publication_date = { ...(filters.publication_date || {}), $lte: date_to };
    }

    if (region) filters.regions = { id: { $in: toArray(region) } };
    if (product) filters.products = { id: { $in: toArray(product) } };
    if (content_type) filters.content_types = { id: { $in: toArray(content_type) } };
    if (key_theme) filters.key_themes = { id: { $in: toArray(key_theme) } };
    if (search_tag) filters.search_tags = { id: { $in: toArray(search_tag) } };
    if (analyst) filters.analysts = { id: { $in: toArray(analyst) } };

    // Load user permissions
    const docs = strapi.documents('plugin::users-permissions.user');
    const fullUser = await docs.findOne({
      documentId: user.documentId,
      populate: {
        role: { fields: ['type'] },
        permission_codes: { fields: ['id', 'documentId'] },
        subscribed_products: { fields: ['id', 'documentId'] },
      },
    });

    const isAdmin = fullUser?.role?.type === 'oe_admin';

    if (scope === 'mine' && !isAdmin) {
      const userProductIds = (fullUser?.subscribed_products || []).map((p) => p.id);
      if (userProductIds.length > 0) {
        filters.products = { id: { $in: userProductIds } };
      }
    }

    const [sortField, sortDir] = sort.split(':');

    const reportDocs = strapi.documents('api::report.report');

    const pageNum = Number(page);
    const limit = Number(per_page);

    const [results, count] = await Promise.all([
      reportDocs.findMany({
        filters,
        sort: `${sortField}:${sortDir || 'desc'}`,
        populate: {
          regions: { fields: ['id', 'name', 'slug'] },
          products: { fields: ['id', 'name', 'slug'] },
          content_types: { fields: ['id', 'name', 'slug'] },
          key_themes: { fields: ['id', 'name', 'slug'] },
          analysts: { fields: ['id', 'name'] },
          permission_codes: { fields: ['id'] },
          featured_image: true,
        },
        start: (pageNum - 1) * limit,
        limit,
        status: 'published',
      }),
      reportDocs.count({ filters, status: 'published' }),
    ]);

    // Post-query permission filtering for non-admins
    let filtered = results;
    if (!isAdmin) {
      const userCodeIds = new Set((fullUser?.permission_codes || []).map((c) => c.id));
      const userProductIds = new Set((fullUser?.subscribed_products || []).map((p) => p.id));

      filtered = results.filter((report) => {
        const reportCodes = (report.permission_codes || []).map((c) => c.id);
        if (reportCodes.length > 0 && !reportCodes.some((id) => userCodeIds.has(id))) {
          return false;
        }
        const reportProducts = (report.products || []).map((p) => p.id);
        if (reportProducts.length > 0 && !reportProducts.some((id) => userProductIds.has(id))) {
          return false;
        }
        return true;
      });
    }

    const sanitised = filtered.map(({ permission_codes, ...rest }) => rest);

    return {
      results: sanitised,
      pagination: {
        page: pageNum,
        per_page: limit,
        total: count,
        total_pages: Math.ceil(count / limit),
      },
    };
  },

  async incrementViewCount(documentId) {
    const docs = strapi.documents('api::report.report');
    const report = await docs.findOne({ documentId, fields: ['view_count'] });
    if (!report) return null;
    return docs.update({
      documentId,
      data: { view_count: (report.view_count || 0) + 1 },
    });
  },
}));

function toArray(val) {
  if (Array.isArray(val)) return val.map(Number);
  return [Number(val)];
}
