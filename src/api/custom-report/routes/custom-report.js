'use strict';

module.exports = {
  routes: [
    { method: 'GET', path: '/custom-reports', handler: 'custom-report.find' },
    { method: 'POST', path: '/custom-reports', handler: 'custom-report.create' },
    { method: 'GET', path: '/custom-reports/:id', handler: 'custom-report.findOne' },
    { method: 'PUT', path: '/custom-reports/:id', handler: 'custom-report.update' },
    { method: 'DELETE', path: '/custom-reports/:id', handler: 'custom-report.delete' },
    { method: 'POST', path: '/custom-reports/:id/share', handler: 'custom-report.share' },
  ],
};
