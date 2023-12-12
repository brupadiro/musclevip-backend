'use strict';

/**
 * price-history service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::price-history.price-history');
