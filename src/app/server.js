require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const userRoute = require('./routes/userRoute');
const customerRoute = require('./routes/customerRoute');
const stockRoute = require('./routes/stockRoute');

app.use(express.json());

app.use('/user', userRoute);
app.use('/customer', customerRoute)
app.use('/stock/item', stockRoute);

mongoose.connect(process.env.DATABASE_URL)
.then(() =>{
    app.emit('ready'); 
})
.catch((e) => {
    console.error(e);
})

app.on('ready', () => {
    app.listen(3000, () => {
        console.log('conectado');
    })
})
