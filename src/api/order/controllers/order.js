'use strict';

/**
 * order controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::order.order', ({
    strapi
  }) => {
    return {
        async create(ctx) {
            const { data } = ctx.request.body;
            data.customer = await strapi.db.query('api::customer.customer').create({
                data:{
                    ...data.customer,
                    store:data.store
                }
            })
            data.product = await strapi.db.query('api::product.product').create({
                data:{
                    ...data.product,
                    store:data.store
                }
            })
            const entity = await strapi.db.query('api::order.order').create({
                data:{
                    ...data,
                    store:data.store
                },
                populate:{
                    customer:true,
                    product:true
                }
            })


            return entity;
        }
    
    }
  });
