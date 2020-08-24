const express = require('express');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const { forwardAuthenticated,ensureAuthenticated } = require('../config/auth');

const app = express.Router();

const userDB = require('../Models/register');
const noteDB = require('../Models/note');
const reminderDB = require('../Models/reminder');
const linkDB = require('../Models/link');

app.get('/', forwardAuthenticated, (req,res)=>{
    res.render('home',{
        title : 'Home',
        nav : true
    })
})

app.get('/login', (req,res)=>{
    res.render('login',{
        title : 'login',
        nav : true
    })
})

app.get('/dashboard',ensureAuthenticated, (req,res)=>{
    const AID = req.user._id;
    reminderDB.find({AID:AID},(err,reminder)=>{
        linkDB.find({AID:AID},(err,link)=>{
            res.render('dashboard',{
                title : 'Dashboard',
                nav: false,
                user : req.user,
                reminder : reminder,
                link : link
            })
        })
    })
})

app.post('/register',(req,res)=>{
    const {name,nickName,email,password,tc} = req.body;
    const newUser = new userDB({name,nickName,email,password});
        bcrypt.genSalt(10,(err,salt)=>{
            bcrypt.hash(newUser.password,salt,(err,hash)=>{
                if(err) throw err;
                newUser.password = hash;
                newUser.save()
                .then(()=>{
                    req.flash('message','You Are Registered.')
                    res.redirect('/login')
                })
                .catch(err => console.log(err))
            })
        })
})

app.post('/login',(req,res,next)=>{
    passport.authenticate('local',{
        successRedirect : '/dashboard',
        failureRedirect : '/login',
        failureFlash : true
    })(req, res, next);
});

app.get('/logout',(req,res)=>{
    req.logout();
    req.flash('sucess_msg','You are Logout Out');
    res.redirect('/');
})

app.get('/share-work', ensureAuthenticated,(req,res)=>{
    noteDB.find({},(err,note)=>{
        res.render('shareWork',{
            title : 'ShareWork',
            nav : false,
            user : req.user,
            note : note
        })
    })
})

app.get('/note', ensureAuthenticated, (req,res)=>{
    const id = req.user._id;
    noteDB.find({AID:id},(err,note)=>{
        if(!note){
            req.flash('error_msg','No Note Present')
            res.redirect('/')
        }
        res.render('note',{
            title : 'Notes',
            nav : false,
            user : req.user,
            note : note
            })
    }).sort({title : -1})
})

app.get('/what-is-next', ensureAuthenticated, (req,res)=>{
    res.render('next',{
        title : 'Next',
        nav : false,
        user : req.user
    })
})

app.get('/q&a', ensureAuthenticated, (req,res)=>{
    res.render('q&n',{
        title : 'question',
        nav : false,
        user : req.user
    })
})

// get request
app.get('/all-reminder',ensureAuthenticated, (req,res)=>{
    const AID = req.user._id;
    reminderDB.find({AID:AID},(err,reminder)=>{
        res.render('reminder',{
            title : 'Reminder',
            nav : false,
            user : req.user,
            reminder : reminder
        })
    })
})
// post request
app.post('/reminder',ensureAuthenticated,(req,res)=>{
      // time funciton
   var time = new Date();
   var d = time.getDate(); // get Today Date
   var h = time.getHours()+6; // get Hours
   var m = time.getMinutes()-30; // get Minite
   var month = time.getMonth()+1;
   var year = time.getFullYear();
   var fullTime;
   if(h < 12){
     fullTime = d+"-"+month+"-"+year+" Time "+h+":"+m+" "+"AM";
   }else{
    h-=12;
     fullTime = d+"-"+month+"-"+year+" Time "+h+":"+m+" "+"PM";
   }
    const {reminder} = req.body;
    const AID = req.user._id;
    const date = fullTime;
    const newReminder = reminderDB({reminder,AID,date})
    newReminder.save()
    .then(()=>{req.flash('down_msg','Your reminder set Successfuly');res.redirect('/')})
    .catch((err)=> console.log(err));
})



// settings
app.get('/account-settings',ensureAuthenticated,(req,res)=>{
    res.render('setting',{
        title : 'Setting',
        user: req.user,
        nav : false
    })
})




// saving notes
app.post('/save-note',ensureAuthenticated,(req,res)=>{
   // time funciton
   var time = new Date();
   var d = time.getDate(); // get Today Date
   var h = time.getHours()+6; // get Hours
   var m = time.getMinutes()-30; // get Minite
   var month = time.getMonth()+1;
   var year = time.getFullYear();
   var fullTime;
   if(h < 12){
     fullTime = d+"-"+month+"-"+year+" Time "+h+":"+m+" "+"AM";
   }else{
       h-=12;
     fullTime = d+"-"+month+"-"+year+" Time "+h+":"+m+" "+"PM";
   }

    const {note,public} = req.body;
    if(public == undefined){
        // private
       const writer = req.user.name;
       const date = fullTime;
       const public = 'Private';
       const AID = req.user._id
       const newNote = noteDB({note,public,writer,date,AID});
       newNote.save()
       .then(()=>{
        req.flash('down_msg','Note Save to Private Note.');
        res.redirect('/');
       })
       .catch((err)=> {
        req.flash('error_msg','Error While Saveing Note Save Again');
        res.redirect('/');
       })
    }else{
        // public
        const writer = req.user.name;
        const date = fullTime;
        const public = 'Public';
        const AID = req.user._id
        const newNote = noteDB({note,public,writer,date,AID})
        newNote.save()
       .then(()=>{
        req.flash('down_msg','Note Save to Private Note.');
        res.redirect('/');
       })
       .catch((err)=> {
        req.flash('error_msg','Error While Saveing Note Save Again');
        res.redirect('/');
       })
    }
})



// link
app.post('/link',ensureAuthenticated,(req,res)=>{
    const {link,For} = req.body;
    const AID = req.user._id;
    const newLink = linkDB({link,AID,For})
    newLink.save()
    .then(()=>{
        req.flash('error','Links Save')
        res.redirect('/')
    })
    .catch(err => console.log(err))
})

app.post('/link-delete',ensureAuthenticated,(req,res)=>{
    const {AID} = req.body;
    linkDB.remove({_id:AID},(err,done)=>{
        req.flash('down_msg','link Delete Succssfuly');
        res.redirect('/')
    })
})


// change password
app.post('/change-password',ensureAuthenticated,(req,res)=>{
    const {currentPassword,newPassword} = req.body;
    bcrypt.compare(currentPassword, req.user.password, (err, isMatch) => {
        if (err) throw err;
        if (isMatch) {
          bcrypt.genSalt(10,(err,salt)=>{
              bcrypt.hash(newPassword,salt,(err,hash)=>{
                  if(err) throw err;
                  const id = req.user._id;
                  userDB.update({_id:id},{
                      $set : { password : hash}
                  })
                  .then(()=>{
                      req.flash('success_msg','Password Change Successfully.')
                      res.redirect('/logout')
                    })
                  .catch(err => console.log(err))
              })
          })  
        } else {
          req.flash('down_msg','Wrong Password');
          res.redirect('/account-settings')
        }
      });
})


// delete account
app.post('/delete-account',ensureAuthenticated,(req,res)=>{
    const {email,password} = req.body;
   if(req.user.email == email){
       bcrypt.compare(password,req.user.password,(err,isMatch)=>{
           if(err) throw err;
           if(isMatch){
               noteDB.remove({AID:req.user._id})
               linkDB.remove({AID:req.user._id})
               reminderDB.remove({AID:req.user._id})
               userDB.deleteOne({_id:req.user._id})
               .then(()=>{
                req.flash('error','Account is Delete');
                res.redirect('/logout')
               })
           }else{
               req.flash('error','Password Incoorect');
               res.redirect('/account-settings');
           }
       })
   }else{
       req.flash('error','incorrect Email');
       res.redirect('/account-settings');
   }
})


app.get('/svg-code',(req,res)=>{
    res.send(<svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" width="679.6657" height="650.59919" viewBox="0 0 679.6657 650.59919"><path d="M930.83285,775.2996h-531a9.01016,9.01016,0,0,1-9-9v-327a9.01016,9.01016,0,0,1,9-9h531a9.01016,9.01016,0,0,1,9,9v327A9.01016,9.01016,0,0,1,930.83285,775.2996Zm-531-343a7.00818,7.00818,0,0,0-7,7v327a7.00818,7.00818,0,0,0,7,7h531a7.00818,7.00818,0,0,0,7-7v-327a7.00818,7.00818,0,0,0-7-7Z" transform="translate(-260.16715 -124.7004)" fill="#3f3d56"/><path d="M869.5,711h-42a2.50263,2.50263,0,0,1-2.5-2.5v-22a2.50263,2.50263,0,0,1,2.5-2.5h30.25a1.5,1.5,0,0,1,0,3H829.5a1.50164,1.50164,0,0,0-1.5,1.5v18a1.50164,1.50164,0,0,0,1.5,1.5h38a1.50164,1.50164,0,0,0,1.5-1.5v-9.53516a1.5,1.5,0,0,1,3,0V708.5A2.50263,2.50263,0,0,1,869.5,711Z" transform="translate(-260.16715 -124.7004)" fill="#3f3d56"/><path d="M795.33285,490.2996h-323a4.5,4.5,0,0,1,0-9h323a4.5,4.5,0,0,1,0,9Z" transform="translate(-260.16715 -124.7004)" fill="#ccc"/><path d="M795.33285,527.2996h-323a4.5,4.5,0,0,1,0-9h323a4.5,4.5,0,0,1,0,9Z" transform="translate(-260.16715 -124.7004)" fill="#ccc"/><path d="M795.33285,564.2996h-323a4.5,4.5,0,0,1,0-9h323a4.5,4.5,0,0,1,0,9Z" transform="translate(-260.16715 -124.7004)" fill="#ccc"/><path d="M795.33285,601.2996h-323a4.5,4.5,0,0,1,0-9h323a4.5,4.5,0,0,1,0,9Z" transform="translate(-260.16715 -124.7004)" fill="#ccc"/><path d="M795.33285,638.2996h-323a4.5,4.5,0,0,1,0-9h323a4.5,4.5,0,0,1,0,9Z" transform="translate(-260.16715 -124.7004)" fill="#ccc"/><circle cx="589.16558" cy="361.09885" r="13" fill="#6c63ff"/><circle cx="589.16558" cy="398.09885" r="13" fill="#ff6584"/><circle cx="589.16558" cy="435.09885" r="13" fill="#6c63ff"/><circle cx="589.16558" cy="472.09885" r="13" fill="#f2f2f2"/><circle cx="589.16558" cy="509.09885" r="13" fill="#f2f2f2"/><path d="M849,703.957a2.79654,2.79654,0,0,1-1.98389-.82031l-8.86963-8.86914a1.50065,1.50065,0,0,1,0-2.1211,1.53688,1.53688,0,0,1,2.12159,0l8.37841,8.37891a.51022.51022,0,0,0,.70655,0l27.87988-27.87891a1.53626,1.53626,0,0,1,2.12109,0,1.5,1.5,0,0,1-.00048,2.1211l-28.36914,28.36914A2.79849,2.79849,0,0,1,849,703.957Z" transform="translate(-260.16715 -124.7004)" fill="#6c63ff"/><ellipse cx="588.83322" cy="600.29925" rx="69" ry="4" opacity="0.1" style="isolation:isolate"/><path d="M339.92,370.62143H264.64765a4.48521,4.48521,0,0,1-4.4805-4.48049V326.71257a4.48521,4.48521,0,0,1,4.4805-4.48049h54.214a2.6883,2.6883,0,1,1,0,5.37659H268.232a2.69123,2.69123,0,0,0-2.68829,2.6883v32.25957a2.69123,2.69123,0,0,0,2.68829,2.6883h68.10355a2.69123,2.69123,0,0,0,2.68829-2.6883V345.46765a2.6883,2.6883,0,0,1,5.3766,0v20.67329A4.48521,4.48521,0,0,1,339.92,370.62143Z" transform="translate(-260.16715 -124.7004)" fill="#3f3d56"/><path d="M303.17991,357.999a5.01186,5.01186,0,0,1-3.55551-1.47017l-15.89614-15.89526a2.68944,2.68944,0,0,1,0-3.80142,2.75438,2.75438,0,0,1,3.8023,0l15.01578,15.01667a.91441.91441,0,0,0,1.26627,0l49.96628-49.96454a2.75328,2.75328,0,0,1,3.80142,0,2.68836,2.68836,0,0,1-.00087,3.80142l-50.84313,50.84313A5.01539,5.01539,0,0,1,303.17991,357.999Z" transform="translate(-260.16715 -124.7004)" fill="#6c63ff"/><rect x="398.95576" y="406.3381" width="99" height="29" rx="4" transform="translate(636.74438 716.9758) rotate(-180)" fill="#2f2e41"/><path d="M491.95577,405.33817h-138a5.99983,5.99983,0,0,0-6,6v95a6.00014,6.00014,0,0,0,6,6h17a6.00014,6.00014,0,0,0,6-6v-72h22v73a6.00014,6.00014,0,0,0,6,6h17a6.00014,6.00014,0,0,0,6-6v-73h64a6.00014,6.00014,0,0,0,6-6v-17A5.99983,5.99983,0,0,0,491.95577,405.33817Z" transform="translate(-260.16715 -124.7004)" fill="#2f2e41"/><path d="M526.595,435.8983l-131.15172-2.76109a6,6,0,0,1-5.72306-7.33474L421.65248,286.002a6,6,0,0,1,5.84935-4.66393h34.34058A49.15467,49.15467,0,0,1,509.95605,320.43l22.63811,108.24129A6,6,0,0,1,526.595,435.8983Z" transform="translate(-260.16715 -124.7004)" fill="#2f2e41"/><circle cx="185.20828" cy="90.65388" r="53.51916" fill="#6c63ff"/><path d="M421.09526,186.53764c-6.2466-1.47341-12.99094-3.45575-17.4464-8.37388-3.79285-4.18673-5.57176-10.64807-2.21078-15.61164,3.069-4.53237,9.12254-6.19536,14.21769-7.04528,5.92227-.98789,12.00846-1.13216,17.56578-3.65269a18.17383,18.17383,0,0,0,6.93172-5.49957,47.27188,47.27188,0,0,0,4.386-7.54814,27.52679,27.52679,0,0,1,4.60234-7.06891,13.9316,13.9316,0,0,1,7.89442-3.85439c6.70456-1.019,13.06965,2.07943,18.34511,5.92718a79.66343,79.66343,0,0,1,13.80488,13.09993,86.63333,86.63333,0,0,1,18.47578,38.152c.39,1.88951,3.28239,1.08984,2.89284-.79752a89.46191,89.46191,0,0,0-16.86856-36.52353A86.52793,86.52793,0,0,0,479.579,133.28459c-5.43616-4.37922-11.71258-8.19574-18.86256-8.55739a19.43748,19.43748,0,0,0-9.58882,1.904,17.44612,17.44612,0,0,0-6.68162,6.22286c-3.36885,5.1093-4.994,11.71166-10.4291,15.16778-5.50526,3.50075-12.39816,3.53523-18.64323,4.5093-5.55466.86639-11.73875,2.69613-15.49907,7.157-4.15942,4.93428-4.003,11.65832-.89623,17.10023,3.45194,6.04659,9.86553,9.34642,16.30636,11.31371,1.654.50521,3.33012.93142,5.013,1.32838,1.87753.44286,2.67881-2.44909.79752-2.89284Z" transform="translate(-260.16715 -124.7004)" fill="#2f2e41"/><path d="M451.158,233.22342c-3.30712-.09277-7.42236-.208-10.59033-2.52246a8.13215,8.13215,0,0,1-3.1997-6.07324,5.471,5.471,0,0,1,1.86035-4.49219c1.65478-1.39941,4.07226-1.72851,6.67822-.96093L443.20736,199.448l1.98145-.27148,3.17334,23.19043-1.65479-.75879c-1.91943-.88086-4.55176-1.32715-6.188.05469a3.51331,3.51331,0,0,0-1.15283,2.89453,6.14748,6.14748,0,0,0,2.38086,4.52832c2.46533,1.80078,5.74561,2.03418,9.46631,2.13769Z" transform="translate(-260.16715 -124.7004)" fill="#2f2e41"/><rect x="162.46941" y="76.4488" width="10.77148" height="2" fill="#2f2e41"/><rect x="196.46941" y="76.4488" width="10.77148" height="2" fill="#2f2e41"/><path d="M343.00521,383.57206a6.50835,6.50835,0,0,1-5.9248-3.80469l-6.11914-13.43164a6.4995,6.4995,0,0,1,3.2207-8.60938l111.94482-50.999a6.50821,6.50821,0,0,1,8.60987,3.2207l6.11914,13.43164a6.50876,6.50876,0,0,1-3.22022,8.61036l-111.94531,50.998A6.46753,6.46753,0,0,1,343.00521,383.57206Z" transform="translate(-260.16715 -124.7004)" fill="#6c63ff"/></svg>);
})



module.exports = app;