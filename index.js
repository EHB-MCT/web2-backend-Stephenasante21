const { MongoClient } = require("mongodb");
 
// Replace the following with your Atlas connection string                                                                                                                                        
const url = "mongodb+srv://stephenasa:stephenasa@cluster0.mgzdpzt.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(url);
 
 // The database to use
 const dbName = "Web2courseproject";
                      
 async function run() {
    try {
         await client.connect();
         console.log("Connected correctly to server");
         const db = client.db(dbName);

         // Use the collection "people"
         const col = db.collection("images");

         // Construct a document                                                                                                                                                              
         let imagesDocument = {
             img_url: "jesup_5",
         }

         // Insert a single document, wait for promise so we can read it back
         const p = await col.insertOne(imagesDocument);
         // Find one document
         const myDoc = await col.findOne();
         // Print to the console
         console.log(myDoc);

        } catch (err) {
         console.log(err.stack);
     }
 
     finally {
        await client.close();
    }
}

run().catch(console.dir);




// login 
