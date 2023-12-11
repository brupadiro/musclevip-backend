module.exports = {
  routes : [
      { // Path defined with a URL parameter
        method: 'POST',
        path: '/orders/tracking',
        handler: 'order-controller.createTrackingInAfterShip',
        },
        { // Path defined with a URL parameter
          method: 'GET',
          path: '/orders/OrdersWithIncidents/:id',
          handler: 'order-controller.OrdersWithIncidents',
        }  


    ]
  }