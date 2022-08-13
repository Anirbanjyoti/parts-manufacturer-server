const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.q8wwfy9.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
// JWT Token verify
function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "UnAuthorized access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "Forbidden access" });
    }
    req.decoded = decoded;
    next();
  });
}

async function run() {
  try {
    const toolCollection = client.db("AutoPoint").collection("tools");
    const reviewCollection = client.db("AutoPoint").collection("reviews");
    const shippingCollection = client
      .db("AutoPoint")
      .collection("shippingDetails");
    const userCollection = client.db("AutoPoint").collection("users");

    //  Get all tools data
    app.get("/tools", async (req, res) => {
      const tools = await toolCollection.find().toArray();
      res.send(tools);
    });
    //  create API to get single data
    app.get("/tools/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const tool = await toolCollection.findOne(query);
      res.send(tool);
    });
    //  Get all reviews data
    app.get("/reviews", async (req, res) => {
      const reviews = await reviewCollection.find().toArray();
      res.send(reviews);
    });
    // Post API-- to create / add Review to all review
    app.post("/review", async (req, res) => {
      const newReview = req.body;
      const result = await reviewCollection.insertOne(newReview);
      res.send(result);
    });
    // Post API-- to create / add shippingDetails to all shippingDetails
    app.post("/shippingDetails", async (req, res) => {
      const newShippingDetails = req.body;
      const result = await shippingCollection.insertOne(newShippingDetails);
      res.send(result);
    });
    // Get API-- to get all shippingDetails data
    app.get("/shippingDetails", async (req, res) => {
      const result = await shippingCollection.find().toArray();
      res.send(result);
    });
    //  // Get API-- to get a single shippingDetails data
    app.get("/shippingDetails/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await shippingCollection.findOne(query);
      res.send(result);
    });

     // Get all user in your website
     app.get("/user", verifyJWT, async (req, res) => {
      const users = await userCollection.find().toArray();
      res.send(users);
    });
    // By 'PUT' method taking Login and registration User data
    app.put("/user/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await userCollection.updateOne(filter, updateDoc, options);
      const token = jwt.sign(
        { email: email },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "1hr" }
      );
      res.send({ result, token });
    });

    
  } finally {
    //
  }
}

run().catch(console.dir);

//   DB_USER=AutoPoint
//   DB_PASS=thDJ2Z45V8jUwCgm

app.get("/", (req, res) => {
  res.send("Auto Point is Running!");
});

app.listen(port, () => {
  console.log(`Auto App listening on port ${port}`);
});
