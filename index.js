const express = require('express')
const app = express()
const cors = require('cors')
const { MongoClient } = require('mongodb')
const {v4: uuidv4, validate: uuidValidate} = require('uuid');
require('dotenv').config()

//mongoclient
const client = new MongoClient(process.env.FINAL_URL)

app.use(express.urlencoded({extended:false}));
app.use(cors())
app.use(express.json())

app.get("/testMongo", async (req,res) => {
    try{
        //connect to the db
        await client.connect();

        //retrieve collection data
        const coll = client.db('Web2courseproject').collection('users');
        const users = await coll.find({}).toArray();

        //send back the data with the response
        res.status(200).send(users);
        }catch(error){
            console.log(error)
            res.status(500).send({
            error: 'Something went wrong'
        })
    }finally{
        await client.close();
    }

})

//REGISTER
app.post("/register", async (req,res) => {

    //check for empty fields 
    //username
    if(!req.body.username){
        res.status(401).send({
            status: "bad Request",
            message: "some field is missing: username"
        })
        return
    }

    //email
    if(!req.body.email){
        res.status(401).send({
            status: "bad Request",
            message: "some field is missing: email"
        })
        return
    }

    //password
    if(!req.body.password){
        res.status(401).send({
            status: "bad Request",
            message: "some field is missing: password"
        })
        return
    }

    //description
    /*if(!req.body.description){
        res.status(401).send({
            status: "bad Request",
            message: "some field is missing: description"
        })
    }*/

    try{
        // Connect to the database
        await client.connect();

        // Retrieve collection data
        const coll = client.db('Web2courseproject').collection('users')

        // Check if a user with the given email already exists
        const existingUser = await coll.findOne({ email: req.body.email })

        if (existingUser) {
            res.status(409).send({
                status: "Authentication error",
                message: "User with this email already exists."
            })
            return
        }

        // Create a new user object
        const user = {
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        uuid: uuidv4()
        }

        // Insert the new user into the database
        const insertedUser = await coll.insertOne(user);

        // Send back a success response when the user is saved
        res.status(201).send({
        status: "Authentication succesfull!!",
        message: "User has been created",
        data: insertedUser
        })
    }catch(error){
        console.log(error)
        res.status(500).send({
            error: 'Something went wrong'
        })
    }finally{
        await client.close();
    }

})

//LOGIN
app.post("/login", async (req,res) => {

    //Check for empty fields
    //email
    if(!req.body.email){
        res.status(401).send({
            status: "bad Request",
            message: "some field is missing: email"
        })
        return
    }

    //password
    if(!req.body.password){
        res.status(401).send({
            status: "bad Request",
            message: "some field is missing: password"
        })
        return
    }

    try{
        //connect to the db
        await client.connect();

        const loginuser = {
            email: req.body.email,
            password: req.body.password,
        }

        //retrieve collection data
        const coll = client.db('Web2courseproject').collection('users');

        const query = {email: loginuser.email}
        const findUser = await coll.findOne(query)

        if(findUser){
            //compare passwords
            if(findUser.password == loginuser.password){
                res.status(200).send({
                    status: "Authentication succesfull!!",
                    message: "You are logged in!!",
                    data: {
                        username: findUser.username,
                        email: findUser.email,
                        uuid: findUser.uuid,
                    }
                })
                return
            }else {
                //password is incorrect
                res.status(401).send({
                    status: "Authentication error",
                    message: "Password is incorrect!!!!"
                })
                return
            }
        }else{
            //no user found send back error
            res.status(401).send({
                status: "Authentication error",
                message: "no user with this email has been found!!!! Register first"
            })
            return
        }

    }catch(error){
        console.log(error)
        res.status(500).send({
            error: 'Authentication error',
            value: error
        })
    }finally{
        await client.close();
    }

})

//VERIFYID
app.post("/veryfyID", async (req,res) => {

    //Check for empty and faulty ID fields
    if(!req.body.uuid){
        res.status(401).send({
            status: "bad Request",
            message: "ID is missing"
        })
        return
    }else{
        if(!uuidValidate(req.body.uuid)){
            res.status(401).send({
                status: "bad Request",
                message: "ID is not a valid UUID"
            })
            return
        }
    }

    try{
        //connect to the db
        await client.connect();

        //retrieve collection data
        const coll = client.db('Web2courseproject').collection('users');

        const query = {uuid: req.body.uuid}
        const user = await coll.findOne(query)

        if(user){
            res.status(200).send({
                status: "Verified",
                message: "Your UUID is valid",
                data: {
                    username: user.username,
                    email: user.email,
                    uuid: user.uuid,
                }
            })
        }else{
            //no user found send back error
            res.status(401).send({
                status: "verify ERROR",
                message: `No user exists with id ${req.body.uuid}`
            })
        }

    }catch(error){
        console.log(error)
        res.status(500).send({
            error: 'Something went wrong',
            value: error
        })
    }finally{
        await client.close();
    }

})

//IMG
app.get("/img", async (req, res) => {
    try{
        //connect to the db
        await client.connect();

        const image = {
            img: req.body.img_url,
            title: req.body.title,
            artist: req.body.artist,
            description: req.body.description,
        }
     
        //retrieve collection data
        const coll = client.db('Web2courseproject').collection('images');

        const getAllImages = await coll.find({}).toArray();

        res.status(200).json(getAllImages);
    }catch(error){
        console.log(error)
        res.status(500).send({
            error: 'Something went wrong'
        })
    }finally{
        await client.close();
    }

})

app.listen(3000);
console.log("app running at http://localhost:3000");
