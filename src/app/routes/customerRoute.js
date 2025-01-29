require('dotenv').config();
const router = require('express').Router();
const customerController = require('../controllers/customerController');



router.post('/create', async (req, res) => {
    let result = await customerController.createCustomer(req.body);
    if(Array.isArray(result)){
        res.status(403).send(result);
    }else if(result == 201){
        res.status(201).send('Customer creation went successfull');
    }else{
        res.status(500).send('System error, try again or contact your supervisor');
    }
})

router.get('/find', async(req, res) => {
    let result = await customerController.findCustomer(req.body);
    
    if(!result.data){
        res.status(500).send('System error, try again or contact your supervisor');
    }else{
        res.status(result.httpRes).send(result.data);
    }
})

router.get('/findAll', async(req, res) => {
    let result = await customerController.findAllCustomers();
    
    if(!result.data){
        res.status(500).send('System error, try again or contact your supervisor');
    }else{
        res.status(result.httpRes).send(result.data);
    }
})

router.patch('/update/:id', async (req, res) => {
    const id = req.params.id;
    
    let result = await customerController.updateCustomer(id, req.body);
    
    if(Array.isArray(result)){
        res.status(result[0].httpRes).send(result[0].data);
    }
    if(result.httpRes){
        res.status(result.httpRes).send(result.data);
    }else{
        res.status(500).send(result.data);
    }

})

router.delete('/delete/:id', async (req, res) => {
    const id = req.params.id;

    let result = await customerController.deleteCustomer(id);
    if(Array.isArray(result)){
        res.status(result[0].httpRes).send(result[0].data);
    }
    if(result.httpRes){
        res.status(result.httpRes).send(result.data);
    }else{
        res.status(500).send('Server error');
    }
})
module.exports = router;