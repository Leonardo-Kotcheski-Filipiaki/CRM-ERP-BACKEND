require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const userRoute = require('./routes/userRoute');
const customerRoute = require('./routes/customerRoute');
const stockRoute = require('./routes/stockRoute');
const serviceOrdersRoute = require('./routes/serviceOrdersRoute');
const cors = require("cors");
app.use(express.json());

const corsOptions ={
   origin:'*', 
   credentials:true,            //access-control-allow-credentials:true
   optionSuccessStatus:200,
};

app.use(cors(corsOptions));
app.use('/user', userRoute);
app.use('/customer', customerRoute);
app.use('/stock/item', stockRoute);
app.use('/serviceorders', serviceOrdersRoute);

mongoose.connect(process.env.DATABASE_URL)
.then(() =>{
    app.emit('ready'); 
})
.catch((e) => {
    console.error(e);
})

app.on('ready', () => {
    app.listen(2000, () => {
        console.log('conectado');
    })
})
