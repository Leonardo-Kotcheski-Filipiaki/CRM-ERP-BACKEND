const mongoose = require('mongoose');
const validator = require('validator');

const stockSchema = new mongoose.Schema({
    itemName: {type: String, required: true},
    description: {type: String},
    qtd: {type: Number, required: true},
    price: {type: Number},

})

const StockModel = mongoose.model("Stock", stockSchema);

class Stock{
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

    async createItem() {
        await this.valida();
        if(this.errors.length > 0)return this.errors;            
        try {
            this.body = cripting.Encrypting(this.body);
            return await StockModel.create(this.body).then(res => {
                if(res.itemName){
                    return 201;
                }else{
                    return 500;
                }
            });
        } catch (error) {
            console.error(error)    
            return this.errors
        }
    }

    async findItem(){
        try {
            if(this.id != null && this.id != 0){
                return await StockModel.find().then(async res => {
                    return new Promise((resolve, reject) => {
                        res.filter(async item => {
                            if(this.id == item.id){
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
                    data: "Item não encontrado"
                }
            } 
        } catch (error) {
            console.error(error);
        }
        
    }

    async findAllItems(){
        try{
            return await StockModel.find().then(async res => {
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

    async updateItem(){
        if(!this.id){
            this.errors.append({
                httpRes: 409,
                data: "Id is not valid or is empty"
            })
            return this.errors;
        }
        try {
            if(Object.keys(this.body).length > 0){
                let cryptedData = cripting.Encrypting(this.body);
                let result = 0;
                for(let i in this.body){
                    result += (await StockModel.updateOne({'_id': this.id}, {[i]: cryptedData[i]})).modifiedCount   
                }
                if(result > 0){
                    return {
                        httpRes: 200,
                        data: `Update successful in ${result} pieces of information from data!` 
                    }
                }else{ 
                    return {
                        httpRes: 204,
                        data: "Update was not successful, the cause may be because the data in database is equal to what has been sended"
                    }
                }
            } else {
                this.errors.push({
                    httpRes: 409,
                    data: "No data found to update the item"
                })
                return this.errors;
            }
        } catch (error) {
            console.error(error);
        }
    }

    async deleteItem(){
        if(!this.id){
            this.errors.append({
                httpRes: 409,
                data: "Id is not valid or is empty"
            })
            return this.errors;
        }
        try {
            const total = (await StockModel.deleteOne({'_id': this.id})).deletedCount
            if(total > 0){
                return {
                    httpRes: 200,
                    data: "Item deleted successfully"
                }
            } else {
                return {
                    httpRes: 403,
                    data: "Item was not found or was not deleted"
                }
            }
        } catch (e) {
            console.error(e);
        }
    }
}

module.exports = Stock;