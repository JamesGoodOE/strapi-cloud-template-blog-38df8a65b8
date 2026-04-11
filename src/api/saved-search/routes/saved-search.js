'use strict';

module.exports = {
  routes: [
    { method: 'GET', path: '/saved-searches', handler: 'saved-search.find' },
    { method: 'POST', path: '/saved-searches', handler: 'saved-search.create' },
    { method: 'PUT', path: '/saved-searches/:id', handler: 'saved-search.update' },
    { method: 'DELETE', path: '/saved-searches/:id', handler: 'saved-search.delete' },
  ],
};
