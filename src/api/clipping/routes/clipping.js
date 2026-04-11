'use strict';

module.exports = {
  routes: [
    { method: 'GET', path: '/clippings', handler: 'clipping.find' },
    { method: 'POST', path: '/clippings', handler: 'clipping.create' },
    { method: 'DELETE', path: '/clippings/clear', handler: 'clipping.clearAll' },
    { method: 'POST', path: '/clippings/reorder', handler: 'clipping.reorder' },
    { method: 'DELETE', path: '/clippings/:id', handler: 'clipping.delete' },
  ],
};
