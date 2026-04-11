'use strict';

module.exports = {
  routes: [
    { method: 'POST', path: '/push-subscriptions', handler: 'push-subscription.create' },
    { method: 'DELETE', path: '/push-subscriptions', handler: 'push-subscription.delete' },
  ],
};
