const Customer = require('../models/curtomerModel');

async function createCustomer(body) {
    const customer = new Customer(body);
    let response = await customer.createCustomer()
    return response;
}

async function findCustomer(body) {
    const customer = new Customer(body);
    let response = await customer.findCustomer()
    return response;
}

async function findAllCustomers(){
    const customer = new Customer();
    let response = await customer.findAllCustomers();
    return response;
}

module.exports.createCustomer = createCustomer;
module.exports.findCustomer = findCustomer;
module.exports.findAllCustomers = findAllCustomers;