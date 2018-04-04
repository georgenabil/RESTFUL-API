const express = require('express');
const router = express.Router({mergeParams: true});
const  mongoose= require('mongoose');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');




router.post('/login', function (req,res,next) {

    User.find({email:req.body.email})
        .exec()
        .then(function (user) {
            console.log(user);
            if (user.length < 1) {
                return res.status(401).json({
                    message: "Auth failed"})
                }

          bcrypt.compare(req.body.password , user[0].password ,function (err,result) {

              if (err) {
                  return res.status(401).json({
                      message: "Auth failed"});
                }

              if (result) {
                  const token = jwt.sign({
                          email: user[0].email,  //payload(body)
                          userId: user[0]._id
                      },
                      process.env.JWT_KEY,      //key
                      {
                          expiresIn: "1h"
                      }
                  );
                  return res.status(200).json({
                      message: "Auth successful",
                      token: token
                  });
              }


          })
        })
        .catch(function (err) {
            res.status(200).json({
                error :err })
        })
});

router.get('/',function (req,res,next) {
   User.find(function (err,result) {
       if(err){console.log(err)}
       else {
           res.status(200).json(result);
       }
   });
});

router.post('/signup', function (req,res,next) {

    User.find({email:req.body.email},function (err,user) {

        if(err){
            console.log(err);
            res.status(500).json({error: err});
        }else
        {
            if(user.length >=1){ res.status(500).json({error:"Mail exists"});}
            else{

                bcrypt.hash(req.body.password, 10,function (err,hash) {
                    if(err){console.log(err);
                        res.status(500).json({error: err});}
                 else {
                        const user = new User({
                        email: req.body.email,
                        password: hash });
                        user.save(function (err, product, numAffected) {
                           if(err){res.status(500).json({error: err});}
                           else{
                            console.log(user);
                            res.status(201).json({
                                message: "User created"
                            });
                           }
                        });
                    }
                });
            }
        }
    }).catch(function (err) {
        console.log(err);
        res.status(500).json({error: err});
    });


});


router.delete('/:userId', function (req,res,next) {

    User.remove({ _id: req.params.userId }).exec()
        .then(function (deleteduser) {
            res.status(200).json({
                message:"user is deleted"
            })
        })
        .catch(function (err) {
            res.status(500).json({
                error:err
            });
        })
});

module.exports=router;