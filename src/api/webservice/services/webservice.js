'use strict';

/**
 * webservice service
 */

const {
  createCoreService
} = require('@strapi/strapi').factories;
const _ = require('lodash');

function mapOrders(orders) {
  return orders.map(payment => ({
    date: new Date(payment.date_add).toLocaleDateString(),
    amount: Number(payment.total_products),
    payment_method: payment.payment,
    products: payment.associations.order_rows
  }));
}

const axios = require("axios");
const qs = require("qs");

module.exports = createCoreService('api::webservice.webservice', ({
  strapi
}) => {
  return {

    
    paymentsByDay(data) {
      const orders = mapOrders(data);
      return orders.reduce((acc, payment) => {
        const {
          date,
          amount,
          payment_method
        } = payment;
        if (!acc[date]) {
          acc[date] = 0;
        }
        acc[date] += amount;
        return acc;
      }, {});
    },
    paymentsByDayAndMethod(data) {
      const orders = mapOrders(data);
      return orders.reduce((acc, payment) => {
        const {
          date,
          amount,
          payment_method
        } = payment;
        if (!acc[date]) {
          acc[date] = {};
        }
        if (!acc[date][payment_method]) {
          acc[date][payment_method] = 0;
        }
        acc[date][payment_method] += amount;
        return acc;
      }, {});
    },
    paymentsByProduct(data) {
      const orders = mapOrders(data);
      return _(orders).groupBy(d => `${d.products[0].product_id}`)
        .map((values, key) => ({
          date: values[0].date,
          product_name: values[0].products[0].product_name.split('(')[0],
          product_price: _.sumBy(values, 'products[0].product_price')
        }))
        .value();
    }
  }
});
