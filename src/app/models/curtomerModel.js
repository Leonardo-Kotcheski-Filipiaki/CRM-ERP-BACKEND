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
        if(id != 0 && id != null){
            this.id = id;
        }
        
        if(body){
            if(typeof body == 'object'){
                this.body = body;
            }
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
            if(error.code == 11000){
                if(Object.keys(error.errorResponse.keyPattern).includes('cpf')){
                    this.errors.push({
                        error: 'CPF',
                        msg:'Um cliente com este CPF já existe!',
                    })
                    
                }
                if(Object.keys(error.errorResponse.keyPattern).includes('cnpj')){
                    this.errors.push({
                        error: 'CNPJ',
                        msg:'Um cliente com este CNPJ já existe!',
                    })
                }
            } else {
                this.errors.push({
                    error: 'Desconhecido',
                    msg: error,
                })
            }
            return this.errors
            
        }
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
                msg:'O e-mail está incorreto ou é invalido, verifique e tente novamente!',
            });
        }
        let resultValidation = {
            cpfResult : await validador.validarCPF(this.body.cpf.trim().replaceAll('.','').replaceAll('-','')).then(res => {return res}).catch(e => {return e}),
            cnpjResult : await validador.validarCNPJ(this.body.cnpj.trim().replaceAll('.','').replaceAll('-','').replaceAll('/','')).then(res => {return res}).catch(e => {return e})
        }
        if(!(resultValidation.cpfResult)){
            this.errors.push({
                error: 'CPF',
                msg:'O CPF inserido está inválido ou incorreto, confira e tente novamente!',
            })
        }
        if(!(resultValidation.cnpjResult)){
            this.errors.push({
                error: 'CNPJ',
                msg:'O CNPJ inserido está invalido ou incorreto, confira e tente novamente!',
            })
        }
        
    }

    async updateCustomer(){
        if(!this.id){
            this.errors.append({
                httpRes: 409,
                data: "Id inválido ou vázio."
            })
            return this.errors;
        }
        try {
            if(Object.keys(this.body).length > 0){
                let cpfValidation = this.body.cpf ? await validador.validarCPF((this.body.cpf.trim().replaceAll('.','').replaceAll('-',''))).then(res => { 
                        return res;
                    })
                    .catch(res => {
                        return res;
                    }) : null;
                let cnpjValidation = this.body.cnpj ? await validador.validarCNPJ((this.body.cnpj.trim().replaceAll('.','').replaceAll('-','').replaceAll('/',''))).then(res => { 
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
                            data: `${result} informações atualizada com sucesso` 
                        }
                    }else{ 
                        return {
                            httpRes: 204,
                            data: "As informações não foram atualizadas, possivelmente por que os dados inserido são iguais aos cadastrados"
                        }
                    }
                } else {
                    this.errors.push({
                        httpRes: 409,
                        data: "CPF/CNPJ inserido não é valido ou está incorreto"
                    })
                    return this.errors;
                }
                
            }
        } catch (error) {
            if(error.code == 11000){
                if(Object.keys(error.errorResponse.keyPattern).includes('cpf')){
                    this.errors.push({
                        httpRes: 403,
                        data:'Um cliente com o mesmo CPF já existe',
                    })
                    
                }
                if(Object.keys(error.errorResponse.keyPattern).includes('cnpj')){
                    this.errors.push({
                        httpRes: 403,
                        data:'Um cliente com o mesmo CNPJ já existe',
                    })
                }
            } else {
                this.errors.push({
                    httpRes: 403,
                    data: error,
                })
            }
            return this.errors
            
        }
    }

    async deleteCustomer(){
        if(!this.id){
            this.errors.append({
                httpRes: 409,
                data: "Id inválido ou vázio."
            })
            return this.errors;
        }
        try {
            const total = (await CustomerModel.deleteOne({'_id': this.id})).deletedCount
            if(total > 0){
                return {
                    httpRes: 200,
                    data: "Cliente excluído com sucesso"
                }
            } else {
                return {
                    httpRes: 403,
                    data: "Cliente não foi encontrado"
                }
            }
        } catch (e) {
            console.error(e);
        }
    }
}

module.exports = Customer;