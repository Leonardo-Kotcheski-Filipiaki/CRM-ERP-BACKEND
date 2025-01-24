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
    constructor(id = 0, body){
        if(id != 0){
            this.id = id;
        }
        
        if(body){
            this.body = body;
        }
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

    async updateCustomer(){
        if(!this.id){
            this.errors.append({
                httpRes: 409,
                data: "Id is not valid or is empty"
            })
            return this.errors;
        }
        if(Object.keys(this.body).length > 0){
            console.log(this.body.cpf)
            let cpfValidation = this.body.cpf ? await validador.validarCPF((this.body.cpf.trim().replaceAll('.','').replaceAll('-',''))).then(res => { 
                    return res;
                })
                .catch(res => {
                    return res;
                }) : null;
            let cnpjValidation = this.body.cpf ? await validador.validarCNPJ((this.body.cnpj.trim().replaceAll('.','').replaceAll('-','').replaceAll('/',''))).then(res => { 
                    return res;
                })
                .catch(res => {
                    return res;
                }) : null;
            
            if((cpfValidation == true || cpfValidation == null) & (cnpjValidation == true || cnpjValidation == null)){
                let cryptedData = cripting.Encrypting(this.body);
                let result = 0;
                for(let i in this.body){
                    result += (await CustomerModel.updateOne({'_id': this.id}, {[i]: cryptedData[i]})).modifiedCount   
                }
                if(result > 0){
                    return {
                        httpRes: 200,
                        data: `Update successful in ${result} pieces of information from data!` 
                    }
                }else{ 
                    return {
                        httpRes: 204,
                        data: "Update was not successful, the cause may be because the data in database is equal to whats has been sended"
                    }
                }
            } else {
                this.errors.push({
                    httpRes: 409,
                    data: "CPF/CNPJ is not valid"
                })
                return this.errors;
            }
            
        }

    }
}

module.exports = Customer;