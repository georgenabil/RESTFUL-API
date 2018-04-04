const express= require('express');
const app = express();

const productRoutes = require('./api/routes/products');
const orderRoutes = require('./api/routes/orders');
const userRoutes = require('./api/routes/user');


const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');



mongoose.connect("mongodb://localhost/Api");

// mongoose.connect("mongodb://"+process.env.MONGO_ATLAS_PW+":admin@cluster0-shard-00-00-nfrvc.mongodb.net:27017,cluster0-shard-00-01-nfrvc.mongodb.net:27017,cluster0-shard-00-02-nfrvc.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin");




app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

app.use("/public",express.static(__dirname + "/public"));


// sloving the cors problem
app.use(function (req,res,next) {

    res.header("Access-Control-Allow-Origin",'*');
    res.header("Access-Control-Allow-Headers",'Origin,X-Requested-with,Content-Type,Accept,Authorization');

    if(req.methods==='OPTIONS'){ // chech in post , put requests

        res.header("Access-Control-Allow-Methods","PUT,POST,PATCH,DELETE,GET");

        return res.status(200).json({});
  }

    next();
});


app.use("/products", productRoutes);
app.use("/orders", orderRoutes);
app.use("/user",userRoutes);

app.use(function (req,res,next) {
    const error= new Error("not found");
    error.status=400;
     next(error);
});

app.use(function (err,req,res,next) {
        res.status(err.status ||500);
        res.json({
            err:{
                message:err.message
            }});
});


module.exports=app;