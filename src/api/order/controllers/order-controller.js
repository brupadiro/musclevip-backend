const PrestaShopAPI = require("../../webservice/services/helpers/prestashop-api");

module.exports = {
    async createTrackingInAfterShip(ctx) {
        const trackingData = ctx.request.body;
        await strapi.service('api::order.order').createTrackingInAfterShip(trackingData);
        return "Ok"
      },
      async OrdersWithIncidents(ctx) {
        const {id} = ctx.params

        const store = await strapi.db.query('api::webservice.webservice').findOne({ where: { id } });

        var entities = await strapi.db.query('api::incident.incident').findMany({
          where: {
              order:{
                store_id:id
          },
        },
          populate:{
            'order':true,
            'img':true
          }
        })
        const orders =  entities.map((e)=>{return e.order.order_id})
        try{
          const API = new PrestaShopAPI(store.apiKey, store.url);
          var response = await API.getIncidentsOrders(orders);
  
          entities = entities.map((order)=>{
            console.log(response.data)
            order.product = response.data.find((e)=>e.order_id == order.order.order_id && e.product_id == order.order.product_id)
            return order
          })
          return {
            orders:entities
          }
  
        } catch {
          return {
            orders:[]
          }
        }
      },
  
}
