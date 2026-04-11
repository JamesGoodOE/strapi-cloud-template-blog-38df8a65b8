'use strict';

module.exports = {
  routes: [
    { method: 'GET', path: '/notes', handler: 'note.find' },
    { method: 'POST', path: '/notes', handler: 'note.create' },
    { method: 'PUT', path: '/notes/:id', handler: 'note.update' },
    { method: 'DELETE', path: '/notes/:id', handler: 'note.delete' },
  ],
};
