const mongoose = require('mongoose');
const cripting = require('../helpers/crypting');

const OSSchema = new mongoose.Schema({
    OS: {type: String, required: true, unique: true},
    cpf: {type: String, required: true},
    cnpj: {type: String},
    toDo: {type: String, required: true},
    description: {type: String, required: true},
    status: {type: String, required: true}
})

const OSModel = mongoose.model("OS", OSSchema);


class OS{
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
        this.finded = 0;
        this.data = [];
    }

    async createOS() {
        await this.valida();
        if(this.errors.length > 0)return this.errors;            
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
            console.log(error)
            this.errors.push({
                error: 'Desconhecido',
                msg: error,
            })  
            return this.errors;          
        }
    }

    async valida() {
        await this.OSNumberCreate().then(res => {
            this.body.OS = res;
        });
        console.log(this.body)
        await this.findExists().then(res => {
            if (res == 'emptyCNPJ'){
                delete this.body.cnpj;
            }
        }).catch(error => {
            this.errors.push({
                error: 'Desconhecido',
                msg: error,
            });
        })
        
    }
    
    async OSNumberCreate(){
        return new Promise(async (resolve, reject) => {
            let result = 0;
            let OSNumber;
            do{
                OSNumber = "";
                while(OSNumber.length < 8){
                    OSNumber = OSNumber+""+Math.ceil(Math.random()*9);
                }
                await OSModel.findOne({'OS': OSNumber}).then(res => {
                    if(res){
                        result = 0;
                    } else {
                        result = 1;
                    }
                })
            }while(result == 0);
            resolve(OSNumber);

        })
    }
    
    async findExists(){
        const conn = await mongoose.connection.db.collection('customers').find().toArray()
        
        return new Promise((resolve, reject) => {
            try {
                conn.forEach(async item => {
                    const cpfDecrypted = await cripting.Decrypting(item.cpf);
                    if(cpfDecrypted == this.body.cpf){
                        if(this.body.cnpj != undefined && this.body.cnpj != null){
                            if(!(validator.isEmpty(this.body.cnpj))){
                                const cnpjDecrypted = await cripting.Decrypting(item.cnpj);
                                if(cnpjDecrypted == this.body.cnpj){
                                    resolve();
                                }
                            } else {
                                resolve('emptyCNPJ');
                            }
                        } else {
                            resolve();
                        }
                    }
                })
                } catch (error) {
                    reject(error);
                }
        })
        
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