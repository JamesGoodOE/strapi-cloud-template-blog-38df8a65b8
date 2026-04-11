module.exports = ({ env }) => ({
  'users-permissions': {
    config: {
      jwt: {
        expiresIn: '7d',
      },
      providers: {
        auth0: {
          enabled: true,
          icon: 'lock',
          key: env('AUTH0_CLIENT_ID', ''),
          secret: env('AUTH0_CLIENT_SECRET', ''),
          subdomain: env('AUTH0_DOMAIN', ''),
          callback: env('AUTH0_CALLBACK_URL', '/api/auth/auth0/callback'),
          scope: ['openid', 'profile', 'email'],
        },
      },
    },
  },
});
