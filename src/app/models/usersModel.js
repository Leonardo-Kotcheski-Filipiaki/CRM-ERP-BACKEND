const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {type: String, required: true},
    surname: {type: String, required: true},
    age: {type: Number, required: true},
    password: {type: String, required: true},
    fullName: {type: String, required: true},
    login: {type: String, maxLength: 16, required: true},
    email: {type: String, unique: true, required: true},
})

const UserModel = mongoose.model("User", userSchema);

class User{
    constructor(body){
        this.body = body;
        this.errors = [];
        this.resultFromDataInsert = null;
    }

    async createUser() {
        this.valida();
        if(this.errors.length > 0)return this.errors;
        try {
            const salt = bcrypt.genSaltSync();
            this.body.password = bcrypt.hashSync(this.body.password, salt);
            return await UserModel.create(this.body).then(res => {
                if(res.name){
                    return 201;
                }
            });
        } catch (error) {
            console.error(error);
        }
    }
    
    valida() {
        this.body.fullName = this.body.name.concat(' ', this.body.surname);
        this.body.login = this.body.name[0].concat('', this.body.surname[0], this.body.age.toString());
        this.body.email = this.body.name.concat('-', this.body.surname.split(' ')[1], '@enterprise.com'); 
        if(!validator.isEmail(this.body.email)){
            this.errors.push({
                error: 'E-mail',
                msg:'E-mail invalido, verifique novamente',
            });
        }
        if(this.body.password.length < 6){
            this.errors.push({
                error: 'Password',
                msg:'A senha tem menos caracteres que o necessário (6 caracteres mínimos)',
            });
        }

    }

    async loginUser(){
        if(!this.body){
            return 404;
        }

        return await UserModel.findOne({login: this.body.login}).then(res => {
            if(bcrypt.compareSync(this.body.password, res.password)){
                return {
                    data: res,
                    httpRes: 302                    
                };
            }else{
                return {
                    httpRes: 404
                };
            }
        })
    }


}

module.exports = User;




