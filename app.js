require("dotenv").config();

const express = require("express");
const app = express();
const ejsMate = require("ejs-mate");
const path = require('path');
const mongoose = require("mongoose");
const expError = require("./utils/expError.js");
const listingRoute = require("./routes/listing.js");
const reviewRoute = require("./routes/review.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport= require("passport"); 
const authRoute= require("./routes/autentication.js");
const MongoStore=require("connect-mongo");

// mongoose.connect('mongodb://127.0.0.1:27017/project');
const dbUrl=process.env.ATLASDB_URL;

async function main(){
    await mongoose.connect(dbUrl);
}

main().then(()=>{
    console.log("connected to db");
})
.catch((err)=>{
    console.log(err);
})

app.set ("view engine", "ejs");
app.engine("ejs",ejsMate); 
app.use (express.json());
app.use (express.urlencoded({extended:true}));
app.use (express.static(path.join(__dirname,"public")));

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
      secret: process.env.SECRET
    },
    touchAfter: 24*3600,
});

store.on("error",()=>{
    console.log("Error in MONGO SESSION");
});

const sessionOptions = {
    // store,
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{ 
        expires:Date.now() + 1*24*60*60*1000,
        maxAge: 1*24*60*60*1000,
        httpOnly:true
    },
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session()); 
  
//Middleware for flash messages 
app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error")
    res.locals.currUser = req.user;
    next();
}) 

app.get("/",(req,res)=>{
    res.redirect("/listing");
})

app.use("/listing", listingRoute);  //Router of listing 
app.use("/review", reviewRoute);    //Router of reviews
app.use("/auth", authRoute); 

//Default route error
app.all("*",()=>{
    throw new expError(404,"Page not found");
})

// Error handling middleware
app.use((err,req,res,next)=>{
    const{status=400,message} = err;
    res.status(status); 
    res.render("error",{err});
    next(err);
});

app.listen(3000,()=>{
    console.log("Server running...");
}); 
