const axios = require("axios");
const qs = require("qs");
const PrestaShopAPI = require("../services/helpers/prestashop-api");
const WordpressAPI = require("../services/helpers/wordpress-api");


module.exports = {

  async orderList(ctx) {
    try {
      const {
        id
      } = ctx.params;
      var orders = {}
      const store = await strapi.db.query('api::webservice.webservice').findOne({
        where: {
          id
        }
      });

      if(store.source=='Fisico') {
        console.log(store)
        orders.orders = await strapi.service('api::order.order').getFisicalOrders(ctx);
      }

      else if(store.source=='Wordpress') {
        const API = new WordpressAPI(store.apiKey,store.secretKey,store.url);
        var response = await API.getCustomEndpoint(ctx);
        orders.orders= response.data;
      } else {
      const API = new PrestaShopAPI(store.apiKey, store.url);
      var response = await API.getCustomEndpoint(ctx);
      console.log("ente aca")
      orders.orders = await Promise.all(response.data.map(async (order) => {
        return {
          ...order,
          product: {
            ...order.product,
          }
        }
      }))
      }



      const  stock = await strapi.db.query('api::stock.stock').findMany({
        store: id
      })
      console.log(orders.orders)
      orders.orders = await Promise.all(orders.orders.map(async (order) => {
        // Buscar el stock correspondiente
        const matchingStock = stock.find(s => s.product_id === order.product.id) ?? {};
        return {
          ...order,
          product: {
            ...order.product,
            ...matchingStock, // Añadir la información del stock al producto
            stock_id:matchingStock.id
          }
        }
      }))
      return orders
    } catch (err) {
      console.log(err)
      return {
        orders:[]
      }
    }
  },


  async order(ctx) {
    const {
      idstore,
      id
    } = ctx.params;


    const store = await strapi.db.query('api::webservice.webservice').findOne({
      where: {
        id: idstore
      }
    });

    if(store.source=='Wordpress') {
      const API = new WordpressAPI(store.apiKey,store.secretKey,store.url);
      const order = await API.getOrderInfo(id)
      return {
        ...order,
      }
    }

    const API = new PrestaShopAPI(store.apiKey, store.url);
    const order = await API.getOrderInfo(id)
    return {
      ...order,
    }

  },


  async update(ctx) {
    const data = ctx.request.body;
    const {
      id
    } = ctx.params;
    // Buscar pedido existente
    console.log(data)
    console.log(id)


  },


  async orderListAllStores(ctx) {


    const {
      user
    } = ctx.state
    const {
      company
    } = ctx.request.query
    const stores = await strapi.db.query('api::webservice.webservice').findMany({
      where: {
        company: company
      },
    });
    const orders = await Promise.all(stores.map(async (store) => {
      
      const storeOrders = await this.orderList({
        request: {
          query: ctx.request.query
        },
        params: {
          id: store.id
        }
      });
      // Agregamos el nombre de la tienda a cada pedido
      storeOrders.orders.forEach(order => order.storeName = store.name);
      storeOrders.orders.forEach(order => order.storeId = store.id);
      storeOrders.total_pages = storeOrders.total_pages ?? 0
      storeOrders.total_count = storeOrders.total_count ?? 0
      return storeOrders

    }));
    // Extraemos los pedidos de cada tienda en un solo array

    // Agregamos esta línea para extraer la fecha de cada pedido
    const allOrders = orders.reduce(
      (accumulator, current) => {
        accumulator.orders.push(...current.orders);
        accumulator.total_pages += current.total_pages;
        accumulator.total_count += parseInt(current.total_count);
        return accumulator;
      }, {
        orders: [],
        total_pages: 0,
        total_count: 0
      }
    )
    allOrders.orders = allOrders.orders.sort((a, b) => {
      const dateA = new Date(a.order.date_add);
      const dateB = new Date(b.order.date_add);
      return dateB -dateA ;
    });
  
    return allOrders;
  

    },
  async payments(ctx) {
    const {
      method
    } = ctx.query;
    const {
      id
    } = ctx.params;
    // Hacemos la petición GET a la API de PrestaShop
    const store = await strapi.db.query('api::webservice.webservice').findOne({
      where: {
        id
      }
    });
    if(store.source =='Wordpress') {
      console.log("aca")
      const API = new WordpressAPI(store.apiKey,store.secretKey,store.url);
      const response = await API.getStats(ctx.request.query);
      return response.data
        return 0
    } else if(store.source =='Fisico') {
      console.log(strapi.service('api::order.order'))
      const response = await strapi.service('api::order.order').getStats(ctx);
      return response
  
    } else {
      const API = new PrestaShopAPI(store.apiKey,store.url);
      const response = await API.getStats(ctx);
      console.log(response)
      return response
    }

  },
  async customers(ctx) {
    const {
      page,
      state
    } = ctx.query;

    const {
      id
    } = ctx.params;
    const store = await strapi.db.query('api::webservice.webservice').findOne({
      where: {
        id: id
      },
    });
    var API = null
    // Configuración para conectarnos a la API de PrestaShop
    if(store.source =='Wordpress') {
      API = new WordpressAPI(store.apiKey,store.secretKey, store.url);
    } else {
      API = new PrestaShopAPI(store.apiKey, store.url);

    }
    // Hacemos la petición GET a la API de PrestaShop
    var customers = []
    try {
      const response = await API.getCustomers(ctx);
      customers = response.data
    } catch (err) {
      console.log("error", err)
    }

    return customers;

  },
  async products(ctx) {
    const {
      method
    } = ctx.query;
    const {
      id
    } = ctx.params;
    // Hacemos la petición GET a la API de PrestaShop
    const store = await strapi.db.query('api::webservice.webservice').findOne({
      where: {
        id
      }
    });
    if(store.source =='Wordpress') {
      const API = new WordpressAPI(store.apiKey,store.secretKey,store.url);
      const response = await API.getProducts(ctx);
      return response.data
    }
    const API = new PrestaShopAPI(store.apiKey, store.url);
    const response = await API.getProducts(ctx);
    return response.data

  },
  async product(ctx) {
    const {
      id
    } = ctx.params;
    const {
      idProduct
    } = ctx.query;
    // Hacemos la petición GET a la API de PrestaShop
      const stores = await strapi.db.query('api::webservice.webservice').findMany()
      var response = []
      for (const store of stores) {
        if(store.source =='Wordpress') {
          const API = new WordpressAPI(store.apiKey,store.secretKey,store.url);
          wordresponse = await API.getProduct(ctx);
          response = [ ...wordresponse.data, ...response]
        } else {
          //const API = new PrestaShopAPI(store.apiKey, store.url);
          //prestaresponse = await API.getProduct(idProduct);
          //response = [ ...prestaresponse.data, ...response]
        }
      }
      return response
  },
  async updateStock(ctx) {
    const {
      quantity
    } = ctx.request.body;
    const {
      id,idProduct
    } = ctx.params;
    // Hacemos la petición GET a la API de PrestaShop
    const store = await strapi.db.query('api::webservice.webservice').findOne({
      where: {
        id
      }
    });
    if(store.source =='Wordpress') {
      const API = new WordpressAPI(store.apiKey,store.secretKey,store.url);
      const response = await API.updateProductStock(idProduct,quantity);
      return response
    }
    const API = new PrestaShopAPI(store.apiKey, store.url);
    const response = await API.updateProductStock(idProduct,quantity);
    return response.data

  },



}
