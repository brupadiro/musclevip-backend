const AxiosHelper = require("./axios-helper");

class PrestaShopAPI {
  constructor(apiToken, baseUrl) {
    this.axiosHelper = new AxiosHelper(apiToken, baseUrl);
  }


  async getCustomEndpoint(ctx) {
      var response = await this.axiosHelper.getRequest('/index.php?fc=module&module=orderinfoapi&controller=orderinfo',ctx.request.query);
    return response;
  }
  async getIncidentsOrders(orders) {
    orders = JSON.stringify(orders)
    var response = await this.axiosHelper.getRequest(`/index.php?fc=module&module=orderinfoapi&controller=uniqueorders&orders=${orders}`);
  return response;
}

  async getStats(ctx) {
    var response = await this.axiosHelper.getRequest('/index.php?fc=module&module=orderinfoapi&controller=salestats',ctx.request.query);
  return response;
}

  async getPayments(ctx) {
    const { start_date, end_date, state, limit, page } = ctx.query;
    const { id } = ctx.params;
    var response = {
      data:{
        orders: []
      }
    }
    try{
      const params = {
        output_format: 'JSON',
        display: 'full',
        sort: 'id_DESC',
        page: page || 1,
            limit: limit || 10,
        ...(start_date && end_date && { 'filter[invoice_date]': `[${start_date},${end_date}]` }),
        ...(state && { 'filter[current_state]': state }),
      };
      response = await this.axiosHelper.getRequest('/api/orders',params);

    }catch(err){
      console.log("Error", err)
    }
    
    return response;
  }
  async getAddressData(addressId) {
    return await this.axiosHelper.getRequest(`/api/addresses/${addressId}?output_format=JSON`);
  }

  async getCustomerData(customerId) {
    return await this.axiosHelper.getRequest(`/api/customers/${customerId}?output_format=JSON`);
  }

  async getOrderData(orderId) {
  
    const response = await this.axiosHelper.getRequest(`/api/orders/${orderId}?output_format=JSON`);
    const data = response.data;
    // Recorrer cada fila de la orden y obtener la información adicional de cada producto, incluyendo las imágenes
    const orderRows = await Promise.all(data.order.associations.order_rows.map(async (orderRow) => {
      const images =  await this.getProductImages(orderRow.product_id, "https://purpleshopweb.com");
      return {
        ...orderRow,
        images: images
      }
    }));
    // Actualizar la propiedad associations.order_rows con las filas de la orden que incluyen las URLs de las imágenes de los productos
    data.order.associations.order_rows = orderRows;
    return data;
  }

  async  getOrderInfo(id) {
    const orderData = await this.getOrderData(id)
    const customerId = orderData.order.id_customer;
    const deliveryAddressId = orderData.order.id_address_delivery;

    // Obtener información adicional de las direcciones
    const deliveryAddress = await this.getAddressData(deliveryAddressId);

    // Obtener información adicional del cliente
    const customerData = await this.getCustomerData(customerId);
    console.log(customerData.data)
    // Obtener información de los productos de la orden
    // Crear objeto JSON con toda la información
    const orderInfo = {
      order: orderData.order,
      deliveryAddress: deliveryAddress.data.address,
      customerData: customerData.data.customer,
    };
    return orderInfo;
  }


  async getProductImages(productId, url) {
    const response = await this.axiosHelper.getRequest(`/api/products/${productId}?output_format=JSON`);
    var productData = response.data;

    // Obtener las URLs de las imágenes del producto
    const imageUrls = await Promise.all(productData.product.associations.images.map(async (image) => {
      return `${url}/${image.id}-large_default/${productData.product.link_rewrite}.jpg`;
    }));

    // Agregar las URLs de las imágenes al objeto de la fila de la orden

    return imageUrls;
  }
  async getProducts(ctx) {
    const { limit, page } = ctx.query;
    var response = {
      data:{
        product: []
      }
    }
    try{
      const params = {
        output_format: 'JSON',
        display: 'full',
        sort: 'id_DESC',
        page: page || 1,
        limit: limit || 10,
      };
      response = await this.axiosHelper.getRequest('/api/products',params);
      response.data.products =   response.data.products.map((p)=>{
        return {
          ...p,
          image:`https://phpstack-1166176-4074041.cloudwaysapps.com/${p.id}/${p.id_default_image}-home_default/${p.link_rewrite}.jpg`
        }
      });
  
    }catch(err){
      console.log("Error", err)
    }
    
    return response;
  }

  async updateProductStock(productId, quantity) {
    const response = await this.axiosHelper.putRequest(`/api/products/${productId}`, { quantity: quantity });
    return response.data
  }
}

module.exports = PrestaShopAPI;
