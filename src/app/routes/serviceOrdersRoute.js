const router = require('express').Router();
const OSController = require('../controllers/serviceOrdersController');

router.post('/create', async (req, res) => {
    let result = await OSController.createOS(req.body);
    if(Array.isArray(result)){
        res.status(403).send(result);
    }else if(result == 201){
        res.status(201).send('OS creation went successfull');
    }else{
        res.status(500).send('System error, try again or contact your supervisor');
    }
})

router.get('/find/:os', async(req, res) => {
    if(req.params.os.length == 8){
        let result = await OSController.findServiceOrder(req.params.os);
        if(Array.isArray(result)){
            if(Object.keys(result[0]).includes('error')){
                res.status(401).send(result);
            }
        }
        if((typeof result) == 'object'){
            if(Object.keys(result).includes('data')){
                res.status(result.httpRes).send(result.data);
            }
        }
    }else{
        res.status(401).send('Número de OS com menos/mais caractéres que o necessário');
    }

    
})

router.get('/findAll', async(req, res) => {
    let result = await OSController.findAllServiceOrders();
    if(!result.data){
        res.status(500).send('System error, try again or contact your supervisor');
    }else{
        res.status(result.httpRes).send(result.data);
    }
})

router.patch('/alter/:OS/:status', async (req, res) => {
    if(!req.params.OS || !req.params.status){
        res.status(401).send('Os dados necessários para alteração (Número da OS e status), não chegaram ao destino');
    }   
    let result = await OSController.updateServiceOrders(req.params, req.body);
    
    if(Array.isArray(result)){
        if(Object.keys(result[0]).includes('error')){
            res.status(401).send(result);
        }
    }
    if((typeof result) == 'object'){
        if(Object.keys(result).includes('data')){
            res.status(result.httpRes).send(result.data);
        }
    }

})

// router.delete('/delete/:id', async (req, res) => {
//     const id = req.params.id;

//     let result = await OSController.deleteCustomer(id);
//     if(Array.isArray(result)){
//         res.status(result[0].httpRes).send(result[0].data);
//     }
//     if(result.httpRes){
//         res.status(result.httpRes).send(result.data);
//     }else{
//         res.status(500).send('Server error');
//     }
// })
module.exports = router;