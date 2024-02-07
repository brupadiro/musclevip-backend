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
            var { data } = ctx.request.body;
            data.customer = (await strapi.db.query('api::customer.customer').create({
                data:{
                    ...data.customer,
                    store:data.store
                }
            })).id
            const entity = await strapi.entityService.create('api::order.order',{
                data:{
                    ...data,
                    store:data.store
                },
                populate:{
                    customer:true,
                    products:true
                }
            })


            return entity;
        }
    
    }
  });
