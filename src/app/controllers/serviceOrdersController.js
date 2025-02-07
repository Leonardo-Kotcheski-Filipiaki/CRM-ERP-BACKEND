const OS = require('../models/serviceOrdersModel');

async function createOS(body) {
    const serviceOrders = new OS(0, body);
    let response = await serviceOrders.createOS();
    return response;
}

// async function findCustomer(body) {
//     const customer = new Customer(0, body);
//     let response = await customer.findCustomer();
//     return response;
// }

async function findAllServiceOrders(){
    const serviceOrders = new OS();
    let response = await serviceOrders.findAllServiceOrders();
    return response;
}

// async function updateCustomer(id, body){
//     if(!body){
//         return [{
//           httpRes: 403,
//           data: "Body was not found and is needed"  
//         }]
//     }
//     const customer = new Customer(id, body);
//     let response = await customer.updateCustomer();
//     return response;
// }

// async function deleteCustomer(id){
//     const customer = new Customer(id);

//     let response = await customer.deleteCustomer();
//     return response;
// }

module.exports.createOS = createOS;
// module.exports.findCustomer = findCustomer;
module.exports.findAllServiceOrders = findAllServiceOrders;
// module.exports.updateCustomer = updateCustomer;
// module.exports.deleteCustomer = deleteCustomer;