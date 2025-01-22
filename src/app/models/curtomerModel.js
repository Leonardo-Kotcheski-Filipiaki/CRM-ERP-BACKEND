const mongoose = require('mongoose');
const validator = require('validator');
const cripting = require('../helpers/crypting');
const validador = require('../helpers/cpf_cnpj_validator');

const customerSchema = new mongoose.Schema({
    name: {type: String, required: true},
    surname: {type: String, required: true},
    cpf: {type: String, required: true, unique: true},
    business_name: {type: String, required: true},
    cnpj: {type: String, unique: true},
    email: {type: String, required: true},
    fullName: {type: String, required: true},

})

const CustomerModel = mongoose.model("Customer", customerSchema);

class Customer{
    constructor(body){
        this.body = body;
        this.errors = [];
        this.resultFromDataInsert = null;
        this.data = [];
    }

    async createCustomer() {
        await this.valida();
        if(this.errors.length > 0)return this.errors;
        try {
            this.body = cripting.Encrypting(this.body);
            return await CustomerModel.create(this.body).then(res => {
                if(res.name){
                    return 201;
                }else{
                    return 500;
                }
            });
        } catch (error) {
            console.error(error);
        }
        return 201;
    }

    async findCustomer(){
        try {
            if(this.body.email){
                return await CustomerModel.find().then(async res => {
                    return new Promise((resolve, reject) => {
                        res.filter(async item => {
                            const emailDecrypted = await cripting.Decrypting(item.email);
                            if(emailDecrypted == this.body.email){
                                this.body = await cripting.Decrypting(item); 
                                resolve({
                                    httpRes: 302,
                                    data: this.body 
                                });           
                            }
                        })
                    })
                    
                }) 
            } else if(this.body.cpf){
                let validacao = await validador.validarCPF((this.body.cpf.trim().replaceAll('.','').replaceAll('-',''))).then(res => {return res}).catch(e => {if(!e) return e});
                if(validacao){
                    return await CustomerModel.find().then(async res => {
                        return new Promise((resolve, reject) => {
                            res.filter(async item => {
                                const cpfDecrypted = await cripting.Decrypting(item.cpf);
                                if(cpfDecrypted == this.body.cpf){
                                    this.body = await cripting.Decrypting(item); 
                                    resolve({
                                        httpRes: 302,
                                        data: this.body 
                                    });           
                                }
                            })
                        })
                        
                    }) 
                } else {
                    return {
                        httpRes: 409,
                        data: "CPF invalido"
                    }
                } 
            } else if(this.body.cnpj){
                let validacao = await validador.validarCNPJ((this.body.cnpj.trim().replaceAll('.','').replaceAll('-','').replaceAll('/',''))).then(res => {return res}).catch(e => {if(!e) return e});;
                if(validacao){
                    return await CustomerModel.find().then(async res => {
                        return new Promise((resolve, reject) => {
                            res.filter(async item => {
                                const cnpjDecrypted = await cripting.Decrypting(item.cnpj);
                                if(cnpjDecrypted == this.body.cnpj){
                                    this.body = await cripting.Decrypting(item); 
                                    resolve({
                                        httpRes: 302,
                                        data: this.body 
                                    });           
                                }
                            })
                        })
                        
                    }) 
                } else {
                    return {
                        httpRes: 409,
                        data: "CNPJ invalido"
                    }
                } 
                
            }
        } catch (error) {
            console.error(error);
        }
        
    }

    async findAllCustomers(){
        try{
            return await CustomerModel.find().then(async res => {
                return new Promise((resolve, reject) => {
                    res.forEach(async item => {
                        this.data.push((await cripting.Decrypting(item)));
                    })
                    resolve({
                        httpRes: 302,
                        data: this.data 
                    });         
                })
                
            })
        }catch(e){
            console.error(e);
        }
    }
        
    async valida() {
        this.body.fullName = this.body.name.concat(' ', this.body.surname);
        if(!validator.isEmail(this.body.email)){
            this.errors.push({
                error: 'E-mail',
                msg:'Something is wrong with the e-mail, check and try again please!',
            });
        }
        let resultValidation = {
            cpfResult : await validador.validarCPF(this.body.cpf.trim().replaceAll('.','').replaceAll('-','')).then(res => {return res}).catch(e => {return e}),
            cnpjResult : await validador.validarCNPJ(this.body.cnpj.trim().replaceAll('.','').replaceAll('-','').replaceAll('/','')).then(res => {return res}).catch(e => {return e})
        }
        if(!(resultValidation.cpfResult)){
            this.errors.push({
                error: 'CPF',
                msg:'Something is wrong with the CPF information, check and try again please!',
            })
        }
        if(!(resultValidation.cnpjResult)){
            this.errors.push({
                error: 'CNPJ',
                msg:'Something is wrong with the CNPJ information, check and try again please!',
            })
        }
        
    }
}

module.exports = Customer;