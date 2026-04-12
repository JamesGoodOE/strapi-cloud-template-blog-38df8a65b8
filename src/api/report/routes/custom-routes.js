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
      path: '/reports/magic-auth/request-link',
      handler: 'magic-auth.requestLink',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/reports/magic-auth/verify',
      handler: 'magic-auth.verifyLink',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
