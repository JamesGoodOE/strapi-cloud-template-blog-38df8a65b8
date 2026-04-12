'use strict';

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::magic-link.magic-link');
