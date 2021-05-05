const express = require('express')
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
const mongoose = require('mongoose');

const Image = require('../Models/image');
const User = require('../Models/register');
const Friend =  require('../Models/friend')


const otherR = express.Router();


// middleware for friends list
const { allFriend } = require('../config/friend')




otherR.get('/', ensureAuthenticated, (req, res) => {
    res.render('otherStuff', {
        title: 'Other',
        nav: false,
        user: req.user,
    })
})


otherR.get('/fileUpload', ensureAuthenticated, (req, res) => {
    res.redirect('/other')
})

otherR.post('/fileUpload', async (req, res) => {
    const {pic} = req.body
    const allot = req.user._id;
    try {
       const response = await Image.create({pic,allot})
       .then(()=>{
           req.flash('success_msg','image uploaded')
           res.redirect('/other/image')
       })
    } catch (error) {
        throw error
    }
    res.json({status : 'ok'})
});


otherR.get('/image', allFriend,ensureAuthenticated, (req, res) => {
    let friends = req.userData
    const allot = req.user._id
    Image.find({ allot }, (err, img) => {
        res.render('image', {
            img,
            user: req.user,
            nav: false,
            title: 'Image',
            friends
        })
    })
})

otherR.get('/image/d/:id', ensureAuthenticated, (req, res) => {
    const { id } = req.params;
    Image.remove({ _id: id })
        .then(() => {
            req.flash('success_msg', '👍 image successfully deleted.')
            return res.redirect('/other/image')
        }).catch(() => {
            req.flash('error', 'Error occour while deling image.')
            return res.redirect('/other/image')
        })
})

otherR.post('/change-profile', (req, res) => {
    const { img } = req.body;
})




otherR.get('/friend/:id',async(req,res)=>{
    const friends = req.params.id
    const user = req.user._id
    try {
        await Friend.findOne({user},async(err,isDB)=>{
            if(!isDB){
                await Friend.create({user,friends})
                req.flash('success_msg','👍 New friend added')
                return res.redirect('/')
            }else{
                const newFriend = await Friend.findOneAndUpdate({user},{
                    $addToSet : {
                        friends
                    }
                })
                req.flash('success_msg','👍 New friend added')
                return res.redirect('/')
            }
        })
    } catch (error) {
        console.log(error)
    }
})







module.exports = otherR;




