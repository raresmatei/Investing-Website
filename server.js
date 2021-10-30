const express = require('express');
const app = express();
const { pool } = require("./dbConfig");
const bcrypt = require("bcrypt");
const session = require('express-session');
const flash = require('express-flash');
const passport = require("passport");

const initializePassport = require('./passportConfig');

initializePassport(passport);

app.set('view-engine', 'ejs');
app.use(express.urlencoded({extended: false}));
app.use(express.static(__dirname));


app.use(session({
    secret: 'secret',

    resave: false,

    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

app.get('/', (req, res) => {
    res.render('index.ejs');
});


app.get('/register', checkAuthenticated, (req, res) => {
    res.render('register.ejs');
});

app.get("/login", checkAuthenticated, (req, res) => {
    // flash sets a messages variable. passport sets the error message
    //console.log(req.session.flash.error);
    res.render("login.ejs");
});

app.get('/AdminDashboard', checkNotAuthenticated, (req, res) => {
    //console.log(req.isAuthenticated());
    res.render('adminDashboard.ejs');
});
  
app.get('/dashboard', isAdmin, checkNotAuthenticated, (req, res) => {
    //console.log(req.isAuthenticated());
    res.render('dashboard.ejs', {user: req.user.first_name});
});

app.get("/logout", (req, res) =>{
    req.logout();
    req.flash("success_msg", "You have logged out");
    res.redirect('/login');
})

app.post('/register', async (req, res) => {
    let {first_name, last_name, card_number, cvv, email, pass, confirm_pass} = req.body;

    console.log({
        first_name,
        last_name,
        card_number,
        email,
        pass,
        confirm_pass
    });

    let errors = [];

    if(!first_name || !last_name || !card_number || !email || !pass || !confirm_pass){
        errors.push(({message: "Please enter all the fields"}));
    }

    if(pass.length < 6){
        errors.push({message: "Password should be at least 6 characters long"});
    }

    if(pass != confirm_pass){
        errors.push({message: "Passwords do not match"});
    }

    let cvvRegex = /^[0-9]{3,4}$/;
    if(!cvv.match(cvvRegex)){
        errors.push({message: "CVV incorrect formmat"});
    }

    let cardNumberRegex = /^(?:(4[0-9]{12}(?:[0-9]{3})?)|(5[1-5][0-9]{14})|(6(?:011|5[0-9]{2})[0-9]{12})|(3[47][0-9]{13})|(3(?:0[0-5]|[68][0-9])[0-9]{11})|((?:2131|1800|35[0-9]{3})[0-9]{11}))$/;
    if(!card_number.match(cardNumberRegex)){
        errors.push({message: "Card number incorrect format"});
    }

    console.log(typeof(errors));
    if(errors.length > 0){
        res.render('register.ejs', {errors});
    }
    else{
        //validation has passed:

        let hashedPassword = await bcrypt.hash(pass, 10);
        console.log(hashedPassword);

        pool.query(
            `SELECT * FROM users
            WHERE email = $1`, [email], (err, results) =>{
                if(err){
                    throw err;
                }
                
                console.log("reaches here");
                console.log(results.rows);

                if(results.rows.length > 0){
                    errors.push({message: "email already registered"});
                    res.render("register.ejs", {errors});
                }
                else{
                    pool.query(
                        `INSERT INTO users(first_name, last_name, card_number, cvv, email, password)
                        VALUES ($1, $2, $3, $4, $5, $6)
                        RETURNING id, password`,
                        [first_name, last_name, card_number, cvv, email, hashedPassword],
                        (err, results) => {
                            if(err){
                                throw err;
                            }
                            console.log(results.rows);
                            req.flash("success_msg", "You are registered. Please log in");
                            res.redirect("/login");
                        }
                    );
                }
            }
        )
    }
});

app.post(
    "/login",
    passport.authenticate("local", {
        successRedirect: "/dashboard",
        failureRedirect: "/login",
        failureFlash: true
    })
)

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return res.redirect("/dashboard");
    }
    next();
  }

function checkNotAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }

    res.redirect('/login');
}

function isAdmin(req, res, next) {
    console.log("enter admin page");
    if (req.isAuthenticated() && (req.user.email === "rares.matei171@gmail.com")) {
        return res.redirect("/AdminDashboard");
    }
    next();
}

app.listen(3001);