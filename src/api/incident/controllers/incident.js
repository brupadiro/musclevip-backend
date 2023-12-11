'use strict';

/**
 * incident controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::incident.incident');
