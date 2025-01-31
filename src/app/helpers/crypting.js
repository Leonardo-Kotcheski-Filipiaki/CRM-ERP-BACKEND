require('dotenv').config();
const crypto = require('crypto');

function Encrypting(data){
    if(typeof data === 'object'){
        const encryptedData = {};
        for(let key in data){
            if(key == 'altId'){
                encryptedData[key] = data[key];
            }else{
                const cipher = crypto.createCipheriv(process.env.ALG, Buffer.from(process.env.CRYPT_KEY_PRIVATE), Buffer.from(process.env.IV));
                if((typeof data[key]) == 'number'){
                    data[key] = data[key].toString();
                }
                encryptedData[key] = cipher.update(data[key], 'utf8', 'hex') + cipher.final('hex');
            }
        }

        return encryptedData;
    }
}

async function Decrypting(data){
    return new Promise((resolve, reject) => {
        if(typeof data === 'object'){
            const decryptedData = {};
            for(let key in data['_doc']){
                const decipher = crypto.createDecipheriv(process.env.ALG, Buffer.from(process.env.CRYPT_KEY_PRIVATE), Buffer.from(process.env.IV));
                if(!(key == '_id') && !(key == '__v') && !(key == 'altId')){
                    decryptedData[key] = decipher.update(data[key], 'hex', 'utf8') + decipher.final('utf8');
                } else if(key == '_id' || key == 'altId'){
                    decryptedData[key] = data[key];
                }
                
            }
            resolve(decryptedData);
        }
        if(typeof data === 'string'){
            const decipher = crypto.createDecipheriv(process.env.ALG, Buffer.from(process.env.CRYPT_KEY_PRIVATE), Buffer.from(process.env.IV));
            const decryptedData = decipher.update(data, 'hex', 'utf8') + decipher.final('utf8');
            resolve(decryptedData);
        }
    })
}

module.exports.Encrypting = Encrypting;
module.exports.Decrypting = Decrypting;