require('dotenv').config();
const express = require('express');
const passport = require('passport');
const session = require('express-session');
const path = require('path');


const app = express();

require('./passport-setup');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({            
    secret: process.env.SECRET,
    resave: true,
    saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());

app.get('/', checkNotAuthenticated, (req, res) => {
    res.render('index.ejs');
});

app.get('/dashboard', checkAuthenticated, (req, res) => {
    res.render('dashboard.ejs');
});

app.get('/success', (req, res) => {
    if (req.user) {
        const { displayName, email, photos } = req.user;
        res.render('profile.ejs', { displayName, email, photos: photos[0].value });
    } else {
        res.redirect('/');
    }
});

app.get('/twitter', passport.authenticate('twitter', { scope: ['profile', 'email'] }));

app.get('/twitter/callback', passport.authenticate('twitter', { failureRedirect: '/failed' }));

app.get('/logout', (req, res) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.session = null;
        res.redirect('/');
        console.log("logging out");
    });
});

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated) {
        return next();
    }
    res.redirect('/');
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/dashboard');
    }
}

app.listen(process.env.PORT, () => {
    console.log("App is on port", process.env.PORT)
})