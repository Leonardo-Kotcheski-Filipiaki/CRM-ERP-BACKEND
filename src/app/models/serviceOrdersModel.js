const mongoose = require('mongoose');
const cripting = require('../helpers/crypting');
const dateH = require('../helpers/dateHelpers');

const OSSchema = new mongoose.Schema({
    OS: {type: String, required: true, unique: true},
    customer: {type: String, required: true},
    toDo: {type: String, required: true},
    description: {type: String, required: true},
    status: {type: String, required: true},
    created_by: {type: String, required: true},
    create_date: {type: String, required: true},
    alter_date: {type: String},
    finish_date: {type: String},
    last_changed_by: {type: String},
})

const OSModel = mongoose.model("OS", OSSchema);


class OS{
    constructor(param){
        if(param){
            if((typeof param) == 'object'){
                this.body = param;
            }else if((typeof param) == 'string'){
                this.OS = param;
            }
        }
        this.errors;
        this.data = [];
    }

    async createOS() {
        await this.valida();
        if((typeof this.errors) == 'object') if(Object.keys(this.errors).length > 0)return this.errors;
        try {
            this.body = cripting.Encrypting(this.body);
            return await OSModel.create(this.body).then(res => {
                if(res.OS){
                    return 201;
                }else{
                    return 500;
                }
            });
        } catch (error) {
            this.errors = {
                error: 'Desconhecido',
                msg: error,
            }  
            return this.errors;          
        }
    }

    async findServiceOrder(){
        if(this.OS){
            try {
                return await OSModel.find().then(async res => {
                    return await new Promise(async (resolve, reject) => {
                        res.forEach(async item => {
                            const osDecrypted = await cripting.Decrypting(item.OS);
                            if(osDecrypted == this.OS){
                                this.body = await cripting.Decrypting(item); 
                                resolve({
                                    httpRes: 302,
                                    data: this.body 
                                });
                            }
                        })
                        setTimeout(() => {
                            resolve({
                                httpRes: 401,
                                data: 'Não foi encontrado nenhuma ordem de serviço com este número de OS' 
                            })
                        }, 10000);
                    })
                    
                }) 
            } catch (error) {
                this.error = {
                    error: 'Desconhecido',
                    data: error,
                }  
                return this.errors;   
            }
        }
    }

    async valida() {
        await this.OSNumberCreate().then(res => {
            this.body.OS = res;
            this.body.create_date = dateH.getDayAndTime();
            this.body.alter_date = dateH.getDayAndTime();
        }).catch(res => {
            if(res == 'NoMoreSpaceLeft'){
                this.errors = {
                    error: "NoMoreSpaceLeft",
                    data: "As ordems de serviço ocuparam seu máximo em números"
                }
                return;
            }
        })
        
        if(!(await this.findExistsCustomer())){
            this.errors = {
                error: 'Cliente',
                msg: "Cliente não encontrado na base de dados.",
            }
        }        
    }
    
    async OSNumberCreate(){
        return new Promise(async (resolve, reject) => {
            let result = 0;
            let count = 0;
            let max = 43046721;
            let find = false;
            let OSNumber;
            do{
                OSNumber = "";
                while(OSNumber.length < 8){
                    OSNumber = OSNumber+""+Math.ceil(Math.random()*9);
                }
                await OSModel.find().then(res => {
                    res.forEach(async item => {
                        let a = cripting.Decrypting(item.OS);
                        count = count + 1;
                        if(a.OS == OSNumber){
                            find = true;
                        }
                    })
                    if(find == false){
                        result = 1;
                    }
                    if(count == max){
                        result = 2;
                    }
                })
            }while(result == 0);
            if(result == 2){
                reject('NoMoreSpaceLeft');
            }else{
                resolve(OSNumber);
            }

        })
    }
    
    async findExistsCustomer(){
        try {
            const res = await mongoose.connection.db.collection('customers').find().toArray()
            let find = false;
            res.forEach((item) => {
                if(item._id == this.body.customer && find == false){
                    find = true;
                }
            })
            if(find){
                return 1;
            }
            return 0
        } catch (error) {
            this.errors = {
                error: 'Desconhecido',
                msg: error,
            }
            return this.errors;   
        }
        

        
    }

    async findAllServiceOrders(){
            try{
                return await OSModel.find().then(async res => {
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


}

module.exports = OS;