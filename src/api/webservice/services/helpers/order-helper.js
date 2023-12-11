function mapOrders(orders) {
  return orders.map((payment) => ({
    date: new Date(payment.date_add).toLocaleDateString(),
    amount: Number(payment.total_products),
    payment_method: payment.payment,
    products: payment.associations.order_rows,
  }));
}

async function getOrderData(orderId, config) {
  const apiUrl = `https://purpleshopweb.com/api/orders/${orderId}?output_format=JSON`;

  const response = await axios.get(apiUrl, config);
  const data = response.data;

  return data;
}

async function getAddressData(addressId, config) {
  const apiUrl = `https://purpleshopweb.com/api/addresses/${addressId}?output_format=JSON`;

  const response = await axios.get(apiUrl, config);
  const data = response.data;
  return data;
}

async function getCustomerData(customerId, config) {
  const apiUrl = `https://purpleshopweb.com/api/customers/${customerId}?output_format=JSON`;
  const response = await axios.get(apiUrl, config);
  const data = response.data;
  return data;
}

async function getOrderInfo(orderData, config) {
  const customerId = orderData.order.id_customer;
  const deliveryAddressId = orderData.order.id_address_delivery;

  // Obtener información adicional de las direcciones
  const deliveryAddress = await getAddressData(deliveryAddressId, config);

  // Obtener información adicional del cliente
  const customerData = await getCustomerData(customerId, config);

  // Crear objeto JSON con toda la información
  const orderInfo = {
    order: orderData.order,
    deliveryAddress: deliveryAddress.address,
    customerData: customerData.customer,
  };
  return orderInfo;
}

module.exports = {
  mapOrders,
  getOrderData,
  getAddressData,
  getCustomerData,
  getOrderInfo,
};
