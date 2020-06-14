const express = require('express');
const routes = express.Router();
const mongoose = require('mongoose');
const bodyparser = require('body-parser');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');

// Models
const user = require('../models/usermodel');
const event = require('../models/events');
const eventRegistrant = require('../models/event_registrants')

require('./passport')(passport);


// using Bodyparser for getting form data
routes.use(bodyparser.urlencoded({ extended: true }));
// using cookie-parser and session 
routes.use(cookieParser('secret'));
routes.use(session({
    secret: 'secret',
    maxAge: 3600000,
    resave: true,
    saveUninitialized: true,
}));
// using passport for authentications 
routes.use(passport.initialize());
routes.use(passport.session());
// using flash for flash messages 
routes.use(flash());

// MIDDLEWARES
// Global variable
routes.use(function (req, res, next) {
    res.locals.success_message = req.flash('success_message');
    res.locals.error_message = req.flash('error_message');
    res.locals.error = req.flash('error');
    next();
});

const checkAuthenticated = function (req, res, next) {
    if (req.isAuthenticated()) {
        res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, post-check=0, pre-check=0');
        return next();
    } else {
        res.redirect('/login');
    }
}

// Connecting To Database
// using Mongo Atlas as database
mongoose.connect('mongodb://localhost:27017/testDB12',{
    useNewUrlParser: true, useUnifiedTopology: true,
}).then(() => console.log("Database Connected")
);


// ALL THE ROUTES 
routes.get('/', (req, res) => {
    res.render('index');
})

routes.post('/register', (req, res) => {
    var { email, username, password, confirmpassword } = req.body;
    var err;
    if (!email || !username || !password || !confirmpassword) {
        err = "Please Fill All The Fields...";
        res.render('index', { 'err': err });
    }
    if (password != confirmpassword) {
        err = "Passwords Don't Match";
        res.render('index', { 'err': err, 'email': email, 'username': username });
    }
    if (typeof err == 'undefined') {
        user.findOne({ email: email }, function (err, data) {
            if (err) throw err;
            if (data) {
                console.log("User Exists");
                err = "User Already Exists With This Email...";
                res.render('index', { 'err': err, 'email': email, 'username': username });
            } else {
                bcrypt.genSalt(10, (err, salt) => {
                    if (err) throw err;
                    bcrypt.hash(password, salt, (err, hash) => {
                        if (err) throw err;
                        password = hash;
                        user({
                            email,
                            username,
                            password,
                        }).save((err, data) => {
                            if (err) throw err;
                            req.flash('success_message', "Registered Successfully.. Login To Continue..");
                            res.redirect('/login');
                        });
                    });
                });
            }
        });
    }
});


// Authentication Strategy
// ---------------


routes.get('/login', (req, res) => {
    res.render('login');
});

routes.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        failureRedirect: '/login',
        successRedirect: '/event_list',
        failureFlash: true,
    })(req, res, next);
});

routes.get('/home', checkAuthenticated, (req, res) => {
    res.render('event_list', { 'user': req.user });
});


routes.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/login');
});


routes.get('/create_event', (req, res) => {
    console.log("Loading Create event page")
    res.render('create_event',{ 'user': req.user });
    // res.redirect('/create_event');
});
 

routes.get('/event_registered_list', (req, res) => {
    return new Promise((resolve, reject)=>{
    userID  = req.session.passport.user
    var events = []
    eventRegistrant.find({ userID: userID }, function (err, data) {
        if (err) throw err;
        if (data) {
            console.log("Event Exists");
            console.log(data)
            for(i=0; i<data.length; i++){
                event.findOne({_id: data[i].eventID}, function(err,event) {
                    console.log("found event")
                    if (err) throw err;
                    if(event){
                        console.log("adding to arr")
                        events.push(event)
                    }
                })
            }
            console.log("returning events")
            console.log(events)
            resolve(res.render('event_registered_list', {"events": events,'user': req.user }))
        } else {
            console.log("got error")
            console.log(err)
            if (err) throw err;
        }
    });
    console.log("Loading Create event page")
    });
    // res.redirect('/create_event');
});


routes.get('/event_list', (req, res) => {
    userID  = req.session.passport.user
    event.find({ userID: userID }, function (err, data) {
        if (err) throw err;
        if (data) {
            console.log("Event Exists");
            res.render('event_list', {"events": data,'user': req.user });
        } else {
            console.log("got error")
            console.log(err)
            if (err) throw err;
        }
    });
    console.log("Loading Create event page")
    // res.redirect('/create_event');
});

routes.post('/events',(req,res)=>{
    console.log("create event function")
    console.log(req.body)
    topic  = req.body.topic
    description = req.body.description
    startDate = req.body.startDate
    endDate =req.body.endDate
    userID  = req.session.passport.user
    duration = req.body.duration
    location = req.body.location
    status  = req.body.status
      event({
            topic,
            description,
            startDate,
            endDate,
            duration,
            userID,
            location,
            status
        }).save((err, data) => {
            if (err) throw err;
            req.flash('success_message', "Registered Successfully.. Login To Continue..");
            res.redirect('/event_list');
                        });
    console.log(req.body)
})

routes.get('/events/:eventID', (req,res)=>{
    eventID = req.params.eventID
    myUserID = req.session.passport.user
    console.log("getting event details for eventID: " + eventID)

    event.findOne({ _id: eventID }, function (err, data) {
        if (err) throw err;
        if (data) {
            console.log("Event Exists");
            isRegistrable = true
            console.log(typeof(myUserID))
            console.log(typeof(data.userID))
            console.log(myUserID)
            console.log(data.userID)
            if (myUserID.toString().trim()  === data.userID.toString().trim() ){
                isRegistrable = false
            }
            res.render('show_event', { 'event': data , 'isRegistrable' :isRegistrable, "user": req.user});
        } else {
            console.log("got error")
            console.log(err)
            if (err) throw err;
        }
    });
    
})

routes.post('/events/:eventID/register', (req,res)=>{
    console.log("create event function")
    console.log(req.body)
    eventID = req.params.eventID
    userID = req.session.passport.user
    status = "registered"
    eventRegistrant({
            eventID,
            userID,
            status
        }).save((err, data) => {
            if (err) throw err;
            req.flash('success_message', "Registered Successfully..");
            res.redirect('/event_list');
        });
    console.log(req.body)
})



module.exports = routes;
