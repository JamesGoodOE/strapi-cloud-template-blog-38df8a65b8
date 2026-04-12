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
      path: '/reports/auth/request-magic-link',
      handler: 'report.requestMagicLink',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/reports/auth/verify-magic-link',
      handler: 'report.verifyMagicLink',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
