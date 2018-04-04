const express= require('express');
var router = express.Router({mergeParams: true});
const Product  = require("../models/product");
const multer = require('multer');
const path=require('path');
const checkAuth = require("../middleware/check_auth");



//const upload = multer({dest:'uploads/'});

const storage = multer.diskStorage({

    destination:'./public/uploads/',
    filename:function (req,file,cb) {
       cb(null,file.fieldname+'-'+Date.now()+ path.extname(file.originalname));
        //cb(null,new Date().toISOString()+file.originalname);
    }
});

const fileFilter = function (req, file ,cb) {

    if(file.mimetype === image/jpeg || file.mimetype === image/png){
        cb(null,true) ;

    }
    else {
        cb(null, false); // file is not saved
    }
};


const checkFileType=function (req,file, cb){
    // Allowed ext
    const filetypes = /jpeg|jpg|png|gif/;
    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimetype = filetypes.test(file.mimetype);

    if(mimetype && extname){
        return cb(null,true);
    } else {
        cb('Error: Images Only!');
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 5 },
    fileFilter: checkFileType
});



router.get('/',function (req,res,next) {

    Product.find().select('name price').exec().then(function (docs) {

        const responsed={

            count:docs.length,
            products: docs.map(function (doc) { //mappes obejcts into arrays

                return{
                    _id:doc._id,
                    name:doc.name,
                    price:doc.price,
                    productImage:doc.productImage,
                    request:{
                        type:"GET",
                        url:'http://localhost:3000/products/'+ doc._id
                    }

                }

            })
        };

        res.status(200).json(responsed)

    }).catch(function (err) {

        console.log(err);
        res.status(500).json({

           error:err
        });

    });

});


router.post('/',checkAuth,upload.single('productImage'), function(req, res, next) {




   //console.log(req.file);

   const pro = new Product({
       name:req.body.name,
       price :req.body.price,
       productImage:req.file.path
   });

        pro
       .save()
       .then(function (product) {
                     console.log('here1');
       console.log(product);
       res.status(201).json({
           message: 'Handling POST requests to /products',
           createdProduct:{

               name:product.name,
               price:product.price,
               productImage:product.productImage,
               request:{
                   type:"GET",
                   url:"http://localhost:3000/products/"+product._id
               }
           }

       });

   }).catch(function (err) {
       console.log(err);
       res.status(500).json({
         error:err
       });
   });


});


router.get('/:productId', function(req, res, next){
    const id = req.params.productId;
    Product.findById(id)
        .select('name price _id productImage')
        .exec()
        .then(function (doc) {
     if(doc){
            res.status(200).json(doc); }
            else{
          res.status(404).json({message:"No id for in the database for this item"});
     }
        })
        .catch(function (err) {
            console.log(err);
            res.status(500).json({
                error:err
            });
        })
});



router.patch('/:productId', checkAuth, function(req, res, next){
     const id = req.params.productId;

    Product.findByIdAndUpdate(id,{name:req.body.name,
        price:req.body.price }).select('name price').exec()
        .then(function (resutl) {
            res.status(200).json({

                message: 'Product updated',
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/products/' + id
                }

            });
        }).
    catch(function (err) {
        res.status(500).json(err);
    });

});

router.delete('/:productId',checkAuth, function(req, res, next){

     const id =req.params.productId;

    Product.remove({_id:id}).exec().then(function (product) {
        console.log(product);
        res.status(200).json({


            message: 'Product deleted',
            request: {
                type: 'POST',
                url: 'http://localhost:3000/products',
                body: { name: 'String', price: 'Number' }
            }
        });

    }

    ).catch(function (err) {
        console.log(err);
        res.status(500).json({
            error:err
        });
    });

});


module.exports=router;