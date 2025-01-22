require('dotenv').config();
const router = require('express').Router();
const userController = require('../controllers/userController');


router.post('/create', async (req, res) => {
    let result = await userController.createUser(req.body);
    if(result == 201){
        res.status(201).send('User creation successfull');
    }else if(result.length > 0){
        res.status(403).send(result)
    }else{
        res.status(500).send('Server error, try again');
    }
})

router.post('/login', async (req, res) => {
    let result = await userController.loginUser(req.body);
    if(result.httpRes == 302){
        res.status(result.httpRes).json(result.data);
    }else if(result.httpRes == 404){
        res.status(result.httpRes).send("User not found");
    }else{
        res.status(500).send('Server error, try again');
    }
})
module.exports = router;