const express = require('express');
require('dotenv').config();
const cors = require('cors')
const app = express();
const port = process.env.PORT || 5000;


//middlewars

app.use(cors());
app.use(express.json())





const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
// const uri = "mongodb+srv://<username>:<password>@cluster0.yfrjdbj.mongodb.net/?retryWrites=true&w=majority";
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yfrjdbj.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri)
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();

        const usersCollection = client.db("focusTaskDB").collection("usersCollection")
        const taskCollections = client.db("focusTaskDB").collection("taskCollections")
        

    // save users in db;
    app.post('/user',async(req,res)=>{
        const doc = req.body;
        console.log(doc)
        const query = {email:doc.email}
        const existingUser = await usersCollection.findOne(query);
        if(existingUser){
            return res.send({message:'User already exist'})
        }
        else{
            const result = await usersCollection.insertOne(doc)
            res.send(result)
        }
    })

    // find all users ;
    app.get('/all-users',async(req,res)=>{
        const result = await usersCollection.find().toArray();
        res.send(result)
    });

    // task save to the db ;
    app.post('/add-task',async(req,res)=>{
        const task = req.body ;
        console.log(111,task)
        const result = await taskCollections.insertOne(task);
        res.send(result)
    });

    // update task status ;

    app.patch('/update-task-status/:id',async(req, res)=>{
        const id = req.params;
        console.log(id);
        const taskInfo = req.body
        console.log('taskInfo',taskInfo)
        const filter = {_id: new ObjectId(id.id)};
        const updateDoc = {
            $set: {
                status: taskInfo.status
            }
        };
        const options = { upsert: true };
        const result = await taskCollections.updateOne(filter,updateDoc,options);
        res.send(result)
    })
    

   //task update all property;
   app.patch('/update-task/:id',async(req,res)=>{
        const id = req.params.id;
        const updateTask = req.body;
        console.log('upadated task id:',id,updateTask)
        const filter ={_id : new ObjectId(id)};
        const updateDoc = {
            $set: {
               date:updateTask.date,
               priority:updateTask.priority,
               title:updateTask.title,
               description:updateTask.description 
            }
        }
        const result = await taskCollections.updateOne(filter,updateDoc);
        res.send(result)
   });


   // delete task;
   app.delete('/deleted-task/:id',async(req,res)=>{
        const id = req.params.id ;
        console.log('deleted id:',id);
        const filter = {_id: new ObjectId(id)};
        const updateDoc ={
            $set: {
                status:'deleted'
            }
        }
        const result = await taskCollections.updateOne(filter,updateDoc);
        res.send(result)
   })

    app.get('/all-todos',async(req,res)=>{
        const email = req.query.user;
        
        console.log(email)
        const query ={user: email}
        const result = await taskCollections.find(query).toArray();
        res.send(result)
    });

    // get single task by id;
    app.get('/update-task/:id',async(req, res)=>{
        const id = req.params.id;
        console.log('id is:',id)
        const query ={_id : new ObjectId(id)};
        const result = await taskCollections.findOne(query);
        res.send(result)
    })



        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);










app.get('/', (req, res) => {
    res.send('hello world')
})

app.listen(port, () => {
    console.log(`focus-task-server is running on port ${port}`)
})