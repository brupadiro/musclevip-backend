'use strict';
const {
  createCoreService
} = require('@strapi/strapi').factories;

const axios = require('axios');
const AFTERSHIP_API_KEY = "asat_8dc9c57908dc4f0a9ff61ae8f39d213b";
module.exports = createCoreService('api::order.order', ({
  strapi
}) => {
  return {
    async getFisicalOrders(ctx) {
      const {
        id
      } = ctx.params;

      const query = ctx.request.query
      var entities = await strapi.db.query('api::order.order').findMany({
        where:{
          store:id,
          /*
          createdAt:{
            $gte:query.startDate,
            $lte:query.endDate
          }
          */
  
        },
        populate:{
          customer:true,
          product:true,
          store:true
        }
      })
      return entities.map(entity => {
        return {
          id: `F${entity.id}-${entity.product.id}`,
          order: {
            id: entity.id,
            reference: entity.reference,
            total_paid: `${entity.total_paid} €`,
            payment: entity.payment,
            date_add: entity.createdAt,
            status: entity.status.toString()
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
            id: entity.product.id,
            name: entity.product.name,
            reference: entity.product.name, // Aquí necesitas la referencia del producto, pero no está en tu objeto original
            price: `${entity.product.price} €`,
            quantity: entity.product.quantity.toString(),
            image_url: "" // Aquí necesitas la URL de la imagen del producto, pero no está en tu objeto original
          },
          storeName: entity.store.name, // Aquí necesitas el nombre de la tienda, pero no está en tu objeto original
          storeId: entity.store.id // Aquí necesitas el ID de la tienda, pero no está en tu objeto original
        };
      });

    }
  }
});
