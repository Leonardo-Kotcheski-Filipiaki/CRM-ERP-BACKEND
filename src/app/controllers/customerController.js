const Customer = require('../models/customerModel');

async function createCustomer(body) {
    const customer = new Customer(0, body);
    let response = await customer.createCustomer();
    return response;
}

async function findCustomer(body) {
    const customer = new Customer(0, body);
    let response = await customer.findCustomer();
    return response;
}

async function findAllCustomers(){
    const customer = new Customer();
    let response = await customer.findAllCustomers();
    return response;
}

async function updateCustomer(id, body){
    if(!body){
        return [{
          httpRes: 403,
          data: "Body was not found and is needed"  
        }]
    }
    const customer = new Customer(id, body);
    let response = await customer.updateCustomer();
    return response;
}

async function deleteCustomer(id){
    const customer = new Customer(id);

    let response = await customer.deleteCustomer();
    return response;
}

module.exports.createCustomer = createCustomer;
module.exports.findCustomer = findCustomer;
module.exports.findAllCustomers = findAllCustomers;
module.exports.updateCustomer = updateCustomer;
module.exports.deleteCustomer = deleteCustomer;