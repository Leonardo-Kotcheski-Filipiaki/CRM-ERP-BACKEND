const Stock = require('../models/stockModel');

async function createItem(body) {
    const stock = new Stock(0, body);
    let response = await stock.createItem();
    return response;
}

async function findItem(id) {
    const stock = new Stock(id);
    let response = await stock.findItem();
    return response;
}

async function findAllItems(){
    const stock = new Stock();
    let response = await stock.findAllItems();
    return response;
}

async function updateItem(id, body){
    if(!body){
        return [{
          httpRes: 403,
          data: "Body was not found and is needed"  
        }]
    }
    const stock = new Stock(id, body);
    let response = await stock.updateItem();
    return response;
}

async function deleteItem(id){
    const stock = new Stock(id);

    let response = await stock.deleteItem();
    return response;
}

module.exports.createItem = createItem;
module.exports.findItem = findItem;
module.exports.findAllItems = findAllItems;
module.exports.updateItem = updateItem;
module.exports.deleteItem = deleteItem;