'use strict';

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/magic-auth/request-link',
      handler: 'magic-auth.requestLink',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/magic-auth/verify',
      handler: 'magic-auth.verifyLink',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
