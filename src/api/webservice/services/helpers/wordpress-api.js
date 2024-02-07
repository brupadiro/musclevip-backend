const axios = require("axios");
const moment = require("moment");
function mapOrderStatus(woocommerceStatus) {
  const statusMap = {
    'pending': '0', // En espera de pago
    'processing': '1', // Preparación en curso
    'on-hold': '3', // En espera de envío
    'completed': '5', // Entregado
    'cancelled': '6', // Cancelado por el cliente
    'refunded': '9', // Devolución
    'failed': '7', // Cancelado por el administrador
    'trash': '10' // Cambio
  };

  return statusMap[woocommerceStatus] || 'Estado desconocido';
}
class WordPressAPI {
  constructor(consumerKey, consumerSecret,baseUrl) {
    this.axios = axios.create({
      baseURL: baseUrl,
      auth: {
        username: consumerKey,
        password: consumerSecret
      }
    });
  }
  async formatOrders() {
    const orders = await this.getIncidentsOrders();
    const formattedOrders = orders.map(order => {
      const orderResponse = {
        id: `${order.id}-${order.products[0].id}`,
        order: {
          id: order.id,
          reference: order.reference,
          total_paid: Tools.displayPrice(order.total_paid_tax_incl, new Currency(order.id_currency)),
          payment: order.payment,
          date_add: order.date_add,
          status: mapOrderStatus(order.status),
        },
        customer: {
          id: order.customer.id,
          name: `${order.customer.firstname} ${order.customer.lastname}`,
          email: order.customer.email,
        },
        delivery_address: {
          address1: order.customer.address.address1,
          address2: order.customer.address.address2,
          postcode: order.customer.address.postcode,
          city: order.customer.address.city,
          state: State.getNameById(order.customer.address.id_state),
          country: Country.getNameById(this.context.language.id, order.customer.address.id_country),
        },
        product: {
          id: order.products[0].id,
          name: order.products[0].name,
          reference: order.products[0].reference,
          price: Tools.displayPrice(order.products[0].price, new Currency(order.id_currency)),
          quantity: order.products[0].quantity,
          image_url: order.products[0].image,
        },
      };
      return orderResponse;
    });
    return formattedOrders;
  }

  async getCustomEndpoint(ctx) {
    const customer = ctx.request.query.customer || '';
    const product = ctx.request.query.product || '';
    const startDate = ctx.request.query.startDate || '';
    const endDate = ctx.request.query.endDate || '';
    const page = parseInt(ctx.request.query.page) || 1;
    const pageSize = parseInt(ctx.request.query.pagesize) || 25;
    let url = `/wp-json/wc/v3/orders`;

    const params = {};

    if (customer !== '') {
      params.customer = customer;
    }

    if (product !== '') {
      params.product = product;
    }

      if (startDate !== '') {
        params.after = new Date(startDate).toISOString();
      }

      if (endDate !== '') {
        params.before = new Date(endDate).toISOString();
      }

    if (page !== 1) {
      params.page = page;
    }

    if (pageSize !== 25) {
      params.pagesize = pageSize;
    }

    url += `?${new URLSearchParams(params).toString()}`;
    console.log(url)

    const response = await this.axios.get(url);
    const orders = response.data.flatMap(order => {
      return order.line_items.map(item => {
        return {
          id: `W${order.id}-${item.product_id}`,
          reference: order.number,
          date_add: order.date_created,
          total_paid_tax_incl: order.total,
          order: {
            id: order.id,
            reference: order.order_key,
            date_add: order.date_created,
            payment: order.payment +" ",
            status: mapOrderStatus(order.status),
          },
  

          payment: {
            amount: order.total,
            payment_method: order.payment_method_title,
            transaction_id: order.transaction_id
          },
          customer: {
            id: order.customer_id,
            email: order.billing.email,
            firstname: order.billing.first_name,
            lastname: order.billing.last_name,
            address: {
              address1: order.billing.address_1,
              address2: order.billing.address_2,
              postcode: order.billing.postcode,
              city: order.billing.city,
              country: order.billing.country,
            }
          },
          product: {
            id: item.product_id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            total: item.total,
            image_url: item.image.src
          }
        };
      });
    });
    return { data: orders };
  }

  async getStats({ start_date, end_date,method }) {
    try {
      if(method =='product') {


      }  else {
        
      }
      const response = await this.axios.get(`/wp-json/wc/v3/reports/sales?period=${method}&date_min=${start_date}&date_max=${end_date}`);
      var dateFormats = {
        'week': function(date) {
          const startOfWeek = moment(date).startOf('isoWeek').format('DD/MM-YYYY');
          const endOfWeek = moment(date).endOf('isoWeek').format('DD/MM/YYYY');
          return `${startOfWeek} al ${endOfWeek}`;
        },
        'month': 'Y-M',
        'year' : 'Y',
      };



      const salesByDate = {};
      response.data.forEach(item => {
        const totals = item.totals;
        let dateFormated = ''
        Object.keys(totals).forEach(date => {
          if(method!='week') {
            dateFormated = moment(date).format(dateFormats[method]);
          } else{
            dateFormated = dateFormats[method](date);
          }
          const sales = parseFloat(totals[date].sales);
          if (salesByDate[dateFormated]) {
            salesByDate[dateFormated] += parseFloat(sales.toFixed(2));
          } else {
            salesByDate[dateFormated] = parseFloat(sales.toFixed(2));
          }

        });
      });
      console.log("aca")
      Object.keys(salesByDate).forEach(date => {
        salesByDate[date] = parseFloat(salesByDate[date].toFixed(2));
      });


      return {data:salesByDate}

      const stats = {
        start_date,
        end_date,
        total_sales: response.data.sales_total,
        total_orders: response.data.total_orders,
        average_order_value: response.data.average_order_value,
        total_customers: response.data.total_customers,
      };
      return stats;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getPayments({ start_date, end_date, status, per_page, page }) {
    const response = await this.axios.get(`/wp-json/wc/v3/orders?status=${status}&before=${start_date}&after=${end_date}&page=${page}&per_page=${per_page}`);
    const payments = response.data.map(payment => {
      return {
        id: payment.id,
        reference: payment.number,
        date_add: payment.date_created,
        total_paid_tax_incl: payment.total,
        payment: {
          amount: payment.total,
          payment_method: payment.payment_method_title,
          transaction_id: payment.transaction_id
        },
        customer: {
          id: payment.customer_id,
          email: payment.billing.email,
          firstname: payment.billing.first_name,
          lastname: payment.billing.last_name,
          address: {
            address1: payment.billing.address_1,
            address2: payment.billing.address_2,
            postcode: payment.billing.postcode,
            city: payment.billing.city,
            country: payment.billing.country,
          }
        },
        products: payment.line_items.map(item => {
          return {
            id: item.product_id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            total: item.total,
            image: item.images[0].src
          };
        })
      };
    });
    return payments;
  }

  async getCustomerData(customerId) {
    if (!Number.isInteger(customerId)) {
      throw new Error("The 'customerId' parameter must be a number");
    }
    const response = await this.axios.get(`/wp-json/wc/v3/customers/${customerId}`);
    const customer = response.data;
    const customerData = {
      id: customer.id,
      email: customer.email,
      firstname: customer.first_name,
      lastname: customer.last_name,
      address: {
        address1: customer.billing.address_1,
        address2: customer.billing.address_2,
        postcode: customer.billing.postcode,
        city: customer.billing.city,
        country: customer.billing.country,
      }
    };
    return customerData;
  }

  async getOrderData(orderId) {
    const response = await this.axios.get(`/wp-json/wc/v3/orders/${orderId}`);
    const order = response.data;
    const orderData = {
      id: order.id,
      reference: order.number,
      date_add: order.date_created,
      total_paid_tax_incl: order.total,
      payment: {
        amount: order.total,
        payment_method: order.payment_method_title,
        transaction_id: order.transaction_id
      },
      customer: {
        id: order.customer_id,
        email: order.billing.email,
        firstname: order.billing.first_name,
        lastname: order.billing.last_name,
        address: {
          address1: order.billing.address_1,
          address2: order.billing.address_2,
          postcode: order.billing.postcode,
          city: order.billing.city,
          country: order.billing.country,
        }
      },
      products: order.line_items.map(item => {
        return {
          id: item.product_id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          total: item.total,
          image: item.images[0].src
        };
      })
    };
    return orderData;
  }

  async getOrderInfo(id) {
    const orderData = await this.getOrderData(id);
    const customerId = orderData.customer_id;

    const customerData = await this.getCustomerData(customerId);

    return {
      order: orderData,
      deliveryAddress: customerData.address,
      customerData,
    };
  }

  async getProductImages(productId) {
    const response = await this.axios.get(`/wp-json/wc/v3/products/${productId}/images`);
    const images = response.data.map(image => {
      return {
        id: image.id,
        src: image.src,
        position: image.position
      };
    });
    return images;
  }
  async getCustomers(ctx) {
    const { page } = ctx.query.pagination;
    const response = await this.axios.get(`/wp-json/wc/v3/customers?page=${page}&per_page=10`);
    const customers = response.data.map(customer => {
      return {
        id: customer.id,
        email: customer.email,
        firstname: customer.first_name,
        lastname: customer.last_name,
        address: {
          address1: customer.billing.address_1,
          address2: customer.billing.address_2,
          postcode: customer.billing.postcode,
          city: customer.billing.city,
          country: customer.billing.country,
        }
      };
    });
    return {data:customers};
  }
  async getProduct(ctx)  {
    const { name } = ctx.query;
    const response = await this.axios.get(`/wp-json/wc/v3/products?search=${name}`);
    return response;
  }
}

module.exports = WordPressAPI;
