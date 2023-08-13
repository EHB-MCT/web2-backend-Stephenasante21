const express = require('express')
const app = express()
const cors = require('cors')
const { MongoClient } = require('mongodb')
const {v4: uuidv4, validate: uuidValidate} = require('uuid');
require('dotenv').config()

//mongoclient
const client = new MongoClient(process.env.FINAL_URL)

const port = process.env.port || 7999;

app.use(express.urlencoded({extended:false}));
app.use(cors())
app.use(express.json())

/*app.get("/testMongo", async (req,res) => {
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

})*/

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

//UPDATE USER
app.put("/update/:userId", async (req,res) => {
    //check for empty fields 
    //username
    if(!req.body.username){
        res.status(401).send({
            status: "bad Request",
            message: "some field is missing: username"
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

    // get the userId
    const userId = req.params.userId;

    try{
        // Connect to the database
        await client.connect();

        // Retrieve collection data
        const coll = client.db('Web2courseproject').collection('users')
        
        // Check if a user with the given email already exists
        const query = {uuid: userId}
        const existingUser = await coll.findOne(query)
        
        if (!existingUser) {
            res.status(404).send({
                status: "Not Found",
                message: "User not found."
            });
            return;
        }

        // Create a new user object
        const updatedUser = {
            username: req.body.username,
            password: req.body.password,
        }

        // Update the user in the database
        await coll.updateOne({ uuid: userId }, { $set: updatedUser });

        res.status(200).send({
            status: "Success",
            message: "User updated successfully.",
            data: updatedUser
        });

    
    }catch(error){
        console.log(error)
        res.status(500).send({
            error: 'Something went wrong: ${error}',
            value: error
        })
    }finally{
        await client.close();
    }
})

//DELETE USER
app.delete("/delete/:userId", async (req, res) => {
    const userId = req.params.userId;

    try {
        // Connect to the database
        await client.connect();

        // Retrieve collection data
        const coll = client.db('Web2courseproject').collection('users');

        // Check if a user with the given UUID exists
        const query = { uuid: userId };
        const existingUser = await coll.findOne(query);

        if (!existingUser) {
            res.status(404).send({
                status: "Not Found",
                message: "User not found."
            });
            return;
        }

        // Delete the user from the database
        await coll.deleteOne(query);

        res.status(200).send({
            status: "Success",
            message: "User deleted successfully."
        });

    } catch (error) {
        console.log(error);
        res.status(500).send({
            error: 'Something went wrong',
            value: error
        });
    } finally {
        await client.close();
    }
});

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

//ARTPIECES
app.get("/artpieces", async (req, res) => {
    try{
        //connect to the db
        await client.connect();

        //retrieve collection data
        const coll = client.db('Web2courseproject').collection('images');

        const getAllImages = await coll.find({}).toArray();

        res.status(200).json(getAllImages);
    }catch(error){
        console.log(error)
        res.status(500).send({
            error: error
        })
    }finally{
        await client.close();
    }
})

// /GET 1 ARTPIECE 
app.get("/artpiece", async (req, res) => {
    try{
        //connect to the db
        await client.connect();

        //retrieve collection data
        const coll = client.db('Web2courseproject').collection('images');

        const image = {img_url: req.query.img_url};

        //find the image based on the image url
        const artpiece = await coll.findOne(image);

        if (image) {
            res.status(200).json(artpiece);
        }else{
            res.status(400).json({
            status: "error",
            message: 'Image:' + req.query.id + 'not found'})
        }
    }catch(error){
        console.log(error)
        res.status(500).send({
            error: 'Something went wrong'
        })
    }finally{
        await client.close();
    }
})    

//SAVE AN ARTPIECE
app.post("/saveartpiece/:userId", async (req, res) => {
    //get the userId
    const userId = req.params.userId;

    try{
        // Connect to the database
        await client.connect();

        // Retrieve collection data
        const coll = client.db('Web2courseproject').collection('savedart');        

        
        const savedart = {
            img_url: req.body.img_url,
            artist: req.body.artist,
            title: req.body.title,
            uuid: userId
        }

        //insert in the database 
        const result = await coll.insertOne(savedart);
        res.status(201).send({
            status: "Succes",
            message: "Art piece saved succesfully.",
            data: savedart
        })
    }catch(error){
        console.log(error);
        res.status(500).send({
            error: 'Something went wrong',
            message: error
        });        
    }finally{
        await client.close();
    }
})

//DISPLAY THE SAVED ART
app.get("/savedartpieces/:userId", async (req, res) => {
    //get the userid
    const userId = req.params.userId;

    try{
        //connect to the database
        await client.connect();

        //retrieve collection data
        const coll = client.db('Web2courseproject').collection('savedart');    

        //find saved art pieces for the user
        const savedArtPieces = await coll.find({ uuid: userId }).toArray();

        res.status(200).json(savedArtPieces);
    } catch(error){
        res.status(500).send({
            error: 'Something went wrong',
            message: error
        });
    }finally{
        await client.close();
    }
})

//DELETE AN ARTPIECE 
app.delete("/deleteartpiece/:userId", async (req, res) => {
    //get the userid
    const userId = req.params.userId;  
    try{
        //connect to the database
        await client.connect();

        //retrieve collection data
        const coll = client.db('Web2courseproject').collection('savedart');     
        
        //check if the artpiece exist 
        const imgurl = req.body.img_url;

        const existingArtpiece = await coll.findOne({img_url: imgurl});

        if(!existingArtpiece) {
            res.status(200).send ({
                status: "art piece not found",
                message: "this art piece is not saved by the user"
            })
        }

        //delete the artpiece
        const result = await coll.deleteOne({img_url: imgurl})

        if(result){
            res.status(200).send({
                status: "Succes",
                message: "art piece successfully deleted."
            })
        } else{
            res.status(500).send({
                status: "Error",
                message: "An error occurred while deleting an art piece"
            })
        }
    } catch(error){
        res.status(500).send({
            error: 'Something went wrong',
            message: error
        });
    }finally{
        await client.close();
    }
})

app.listen(3000);
console.log("app running at http://localhost:3000");

