module.exports = {
    routes : [
        { // Path defined with a URL parameter
            method: 'POST',
            path: '/webservices/order/update/:id',
            handler: 'webservice-wordpress-controller.update',
        },
        { // Path defined with a URL parameter
            method: 'GET',
            path: '/webservices/order/:idstore/:id',
            handler: 'webservice-wordpress-controller.order',
        },
        { // Path defined with a URL parameter
            method: 'GET',
            path: '/webservices/wordpress/products/:id',
            handler: 'webservice-wordpress-controller.products',
        },
        { // Path defined with a URL parameter
            method: 'PUT',
            path: '/webservices/updateStock/:id/:idProduct',
            handler: 'webservice-wordpress-controller.updateStock',
        },

        { // Path defined with a URL parameter
            method: 'GET',
            path: '/webservices/wordpress/customers/:id',
            handler: 'webservice-wordpress-controller.customers',
        },

        { // Path defined with a URL parameter
            method: 'GET',
            path: '/webservices/orderListallstores/',
            handler: 'webservice-wordpress-controller.orderListAllStores',
        },


        { // Path defined with a URL parameter
            method: 'GET',
            path: '/webservices/orderList/:id',
            handler: 'webservice-wordpress-controller.orderList',
        },
        { // Path defined with a URL parameter
            method: 'GET',
            path: '/webservices/payments/:id',
            handler: 'webservice-wordpress-controller.payments',
        },


    ]
    
}