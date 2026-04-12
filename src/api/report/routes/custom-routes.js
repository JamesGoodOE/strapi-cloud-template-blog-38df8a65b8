'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/reports/catalogue',
      handler: 'report.catalogue',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/reports/request-magic-link',
      handler: 'report.requestMagicLink',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/reports/verify-magic-link',
      handler: 'report.verifyMagicLink',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
