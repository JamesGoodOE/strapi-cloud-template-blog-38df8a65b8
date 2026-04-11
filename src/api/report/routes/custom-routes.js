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
  ],
};
