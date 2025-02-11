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
            this.body.create_date = dateH.getDayAndTime();
            this.body.alter_date = dateH.getDayAndTime();
        });
        
        if(!(await this.findExists())){
            this.errors.push({
                error: 'Cliente',
                msg: "Cliente não encontrado na base de dados.",
            })
        }        
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