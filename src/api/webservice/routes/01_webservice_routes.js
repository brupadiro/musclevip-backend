module.exports = {
    routes : [
        { // Path defined with a URL parameter
            method: 'POST',
            path: '/webservices/order/update/:id',
            handler: 'webservice-controller.update',
        },
        { // Path defined with a URL parameter
            method: 'GET',
            path: '/webservices/order/:idstore/:id',
            handler: 'webservice-controller.order',
        },
        { // Path defined with a URL parameter
            method: 'GET',
            path: '/webservices/products/:id',
            handler: 'webservice-controller.products',
        },
        { // Path defined with a URL parameter
            method: 'PUT',
            path: '/webservices/updateStock/:id/:idProduct',
            handler: 'webservice-controller.updateStock',
        },

        { // Path defined with a URL parameter
            method: 'GET',
            path: '/webservices/customers/:id',
            handler: 'webservice-controller.customers',
        },

        { // Path defined with a URL parameter
            method: 'GET',
            path: '/webservices/orderListallstores/',
            handler: 'webservice-controller.orderListAllStores',
        },


        { // Path defined with a URL parameter
            method: 'GET',
            path: '/webservices/orderList/:id',
            handler: 'webservice-controller.orderList',
        },
        { // Path defined with a URL parameter
            method: 'GET',
            path: '/webservices/payments/:id',
            handler: 'webservice-controller.payments',
        },


    ]
    
}