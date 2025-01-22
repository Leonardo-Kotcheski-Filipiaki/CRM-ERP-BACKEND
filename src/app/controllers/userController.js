const User = require('../models/usersModel');

async function createUser(body) {
    const user = new User(body);
    let response = await user.createUser();
    return response;
}

async function loginUser(body){
    const user = new User(body);
    let response = await user.loginUser();
    return response;
}

module.exports.createUser = createUser;
module.exports.loginUser = loginUser;