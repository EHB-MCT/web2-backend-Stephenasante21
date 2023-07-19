const express = require('express')
const app = express()
const cors = require('cors')

let users= [];

app.use(express.urlencoded({extended:false}));
app.use(cors())
app.use(express.json())

app.post("/register", (req,res) => {
    
    //check for empty fields 
    //username
    if(!req.body.username){
        res.status(401).send({
            status: "bad Request",
            message: "some field is missing: username"
        })
    }

    //email
    if(!req.body.email){
        res.status(401).send({
            status: "bad Request",
            message: "some field is missing: email"
        })
    }

    //password
    if(!req.body.password){
        res.status(401).send({
            status: "bad Request",
            message: "some field is missing: password"
        })
    }

    //description
    if(!req.body.description){
        res.status(401).send({
            status: "bad Request",
            message: "some field is missing: description"
        })
    }

    //send back it worked response when user is saved 
    res.send({
        status: "Saved",
        message: "User has been saved"
    })


        //save to users array 
        users.push({
            username: req.body.username,
            description: req.body.description,
            email: req.body.email,
            password: req.body.password,
        })


})

app.post("/login", (req,res) => {

    //email
    if(!req.body.email){
        res.status(401).send({
            status: "bad Request",
            message: "some field is missing: email"
        })
    }

    //check for user in array user
    let user = users.find(element => element.email == req.body.email)

    if(user){
        //compare passwords
        if(user.password == req.body.password){
            res.status(200).send({
                status: "OK SUCCES",
                message: "YOU ARE LOGGGED IN"
            })
        }else {
            res.status(401).send({
                status: "ERROR",
                message: "Password is incorrect!!!!"
            })
        }
    }else{
        //no user found send back error
        res.status(401).send({
            status: "ERROR",
            message: "no user with this email has been found!!!! Register first"
        })
    }
})

app.listen(3000);
console.log("app running at http://localhost:3000");
