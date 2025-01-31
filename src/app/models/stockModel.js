const mongoose = require('mongoose');
const validator = require('validator');
const cripting = require('../helpers/crypting');

const stockSchema = new mongoose.Schema({
    altId: {type: String, required: true, unique: true},
    itemName: {type: String, required: true},
    description: {type: String},
    qtd: {type: String, required: true},
    price: {type: String},
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
        }
    }

    async findItem(){
        try {
            console.log(this.id)
            if(this.id != null && this.id != 0){
                return await StockModel.findOne({'altId': this.id}).then(async res => {
                    return new Promise(async (resolve, reject) => {
                        this.body = await cripting.Decrypting(res); 
                        resolve({
                            httpRes: 302,
                            data: this.body 
                        });           
                    })
                }) 
            } else {
                return {
                    httpRes: 409,
                    data: "Item não encontrado pois o id inserido é nulo ou está vázio"
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
        if(!this.body.altId){
            this.errors.push({
                error: 'Id',
                msg: "Item não foi criado por que o Id é nulo ou está vázio!"
            })
        }
        if(validator.isEmpty(this.body.itemName)){
            this.errors.push({
                error: 'Item name',
                msg: "Item não foi criado por que o nome é nulo ou está vázio!"
            })
        }
        if(!this.body.qtd){
            this.errors.push({
                error: 'Quantidade',
                msg: "Item não foi criado por que a informação quantidade é nula ou está vázia (coloque ao menos um 0)"
            })
        }
    }

    async updateItem(){
        if(!this.id){
            this.errors.append({
                httpRes: 409,
                data: "Id inválido ou vázio."
            })
            return this.errors;
        }
        try {
            if(Object.keys(this.body).length > 0){
                let cryptedData = cripting.Encrypting(this.body);
                let result = 0;
                for(let i in this.body){
                    result += (await StockModel.updateOne({'altId': this.id}, {[i]: cryptedData[i]})).modifiedCount   
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
                    data: "Nenhuma informação encontrada para atualizar o item"
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
                data: "Id inválido ou vázio."
            })
            return this.errors;
        }
        try {
            const total = (await StockModel.deleteOne({'altId': this.id})).deletedCount
            if(total > 0){
                return {
                    httpRes: 200,
                    data: "Item excluído com sucesso!"
                }
            } else {
                return {
                    httpRes: 403,
                    data: "Não foi encontrado nenhum item para excluir"
                }
            }
        } catch (e) {
            console.error(e);
        }
    }
}

module.exports = Stock;