'use strict';
const {
  createCoreService
} = require('@strapi/strapi').factories;

const axios = require('axios');
const moment = require('moment');
const AFTERSHIP_API_KEY = "asat_8dc9c57908dc4f0a9ff61ae8f39d213b";
module.exports = createCoreService('api::order.order', ({
  strapi
}) => {
  return {
    async getFisicalOrders(ctx) {
      const {
        id
      } = ctx.params;

      var entities = await strapi.db.query('api::order.order').findMany({
        where: {
          store: id,
          /*
          createdAt:{
            $gte:query.startDate,
            $lte:query.endDate
          }
          */

        },
        populate: {
          customer: true,
          products: true,
          store: true
        }
      })
      console.log(id)
      console.log(entities)
      return entities.flatMap(entity => {
        return entity.products.map((product)=>{
          return {
            id: `F${entity.id}-${product.product_id}`,
            order: {
              id: entity.id,
              reference: entity.reference,
              total_paid: `${entity.total_paid} €`,
              payment: entity.payment,
              date_add: entity.createdAt,
              status: entity.status.toString() ?? ""
            },
            customer: {
              id: entity.customer.id,
              name: entity.customer.name,
              email: entity.customer.email
            },
            delivery_address: {
              address1: entity.customer.address1,
              address2: entity.customer.address2,
              postcode: entity.customer.postcode,
              city: entity.customer.city,
              state: entity.customer.state,
              country: entity.customer.country
            },
            product: {
              id: product.product_id,
              name: product.name,
              reference: product.name, // Aquí necesitas la referencia del producto, pero no está en tu objeto original
              price: `${product.price} €`,
              quantity: product.quantity ?? 0,
              image_url: product.image_url // Aquí necesitas la URL de la imagen del producto, pero no está en tu objeto original
            },
            storeName: entity.store.name, // Aquí necesitas el nombre de la tienda, pero no está en tu objeto original
            storeId: entity.store.id // Aquí necesitas el ID de la tienda, pero no está en tu objeto original
          };
  
        })
      });

    },
    async getStats(ctx) {
      const {
        id
      } = ctx.params;
      const {
        start_date,
        end_date,
        method
      } = ctx.request.query;

      const startDate = new Date(start_date);
      const endDate = new Date(end_date);
      var dateFormats = {
        'week': function (date) {
          const startOfWeek = moment(date).startOf('isoWeek').format('DD/MM-YYYY');
          const endOfWeek = moment(date).endOf('isoWeek').format('DD/MM/YYYY');
          return `${startOfWeek} al ${endOfWeek}`;
        },
        'month': 'Y-M',
        'year': 'Y',
      };

      const orders = await strapi.db.query('api::order.order').findMany({
        where: {
          store: id,
          createdAt: {
            $gte: startDate,
            $lte: endDate
          }
        }
      });

      const formattedOrders = orders.reduce((result, order) => {
        const date = moment(order.createdAt).format(dateFormats[method]);
        if (!result[date]) {
          result[date] = 0;
        }
        result[date] += order.total_paid;
        return result;
      }, {});
      return formattedOrders
      
      return Object.entries(formattedOrders).map(([date, total_paid]) => ({
        date,
        total_paid
      }));
    },
    // ...
  }
});