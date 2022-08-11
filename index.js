const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.q8wwfy9.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true, 
    serverApi: ServerApiVersion.v1 
});


async function run() {
    try {
        const toolCollection = client.db('AutoPoint').collection('tools');
        const reviewCollection = client.db('AutoPoint').collection('reviews');
        //  Get all tools data
        app.get('/tools', async (req, res) => {
            const tools = await toolCollection.find().toArray();
            res.send(tools);
          });
        //  Get all reviews data
        app.get('/reviews', async (req, res) => {
            const reviews = await reviewCollection.find().toArray();
            res.send(reviews);
          });
    // Post API-- to create / add Review to all service
    app.post("/review", async (req, res) => {
        const newReview = req.body;
        const result = await reviewCollection.insertOne(newReview);
        res.send(result);
      });


    }
    finally {
        // 
    }
  }
  
  run().catch(console.dir);
  
//   DB_USER=AutoPoint
//   DB_PASS=thDJ2Z45V8jUwCgm
  
  app.get('/', (req, res) => {
    res.send('Auto Point is Running!')
  })
  
  app.listen(port, () => {
    console.log(`Auto App listening on port ${port}`)
  })