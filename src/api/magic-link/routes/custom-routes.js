'use strict';

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/magic-links/request-link',
      handler: 'magic-link.requestLink',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/magic-links/verify',
      handler: 'magic-link.verifyLink',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
