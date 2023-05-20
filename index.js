const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;


// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ist6ay7.mongodb.net/?retryWrites=true&w=majority`;

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
        await client.connect();

        const toysCollection = client.db('toys').collection('toysCollection');

        const indexKeys = { toyName: 1, subCategory:1 };
        const indexOptions = {name: "NameCategory"};

        const result = await toysCollection.createIndex(indexKeys,indexOptions);

        app.get("/getToysByText/:text", async (req, res) => {
            const searchText = req.params.text;
            const result = await toysCollection
                .find({
                    $or: [
                        { toyName: { $regex: searchText, $options: "i" } },
                        { subCategory: { $regex: searchText, $options: "i" } },
                    ],
                })
                .toArray();
            res.send(result);
        });


        app.get('/toys', async (req,res) =>{
            console.log(req.params.text)
            const cursor = toysCollection.find();
          
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/toys/:id', async (req,res) =>{
            const id = req.params.id;
const query = {_id: new ObjectId(id)}
const result = await toysCollection.findOne(query);
            res.send(result);
        })

 app.get('/toys/:email', async (req,res) =>{
    console.log(req.params.email);
            // const id = req.params.id;
// const query = {_id: new ObjectId(id)}
// const result = await toysCollection.findOne(query);
//             res.send(result);
        });

//     
app.get('/addToys', async(req,res) =>{
    console.log(req.query.sellerEmail);
    let query ={};
    if (req.query?.sellerEmail){
        query = { sellerEmail: req.query.sellerEmail }
    }
    const result = await toysCollection.find(query).toArray();
    res.send(result);
})


        app.post('/addToys', async (req,res) =>{
            const adding = req.body;
            console.log(adding);
            const result = await toysCollection.insertOne(adding);
           res.send(result);
        })


        app.delete('/remove/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await toysCollection.deleteOne(query);
            res.send(result);
            console.log(result);
        })
        
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);




app.get('/',(req,res) =>{
    res.send('shop is running')
})

app.listen(port,() =>{
    console.log(`shop server is running on port ${port}`)
})