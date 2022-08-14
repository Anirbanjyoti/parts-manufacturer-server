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
    const postCollection = client.db("AutoPoint").collection("blogPosts");

    //  Get all tools data
    app.get("/tools", async (req, res) => {
      const tools = await toolCollection.find().toArray();
      res.send(tools);
    });
    //  create API to get single data
    /**
     * hence i have used try catch to avoid 'UnhandledPromiseRejectionWarning':
    */
    app.get("/tools/:id", async (req, res, next) => {
      try{
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const tool = await toolCollection.findOne(query);
        res.send(tool);
      }catch(err){
        next(err);
      }

    });
    // Post API-- to create / add tool to all tools
    app.post("/tools", async (req, res) => {
      const newTool = req.body;
      const result = await toolCollection.insertOne(newTool);
      res.send(result);
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
    //  Get all POsts data
    app.get("/post", async (req, res) => {
      const posts = await postCollection.find().toArray();
      res.send(posts);
    });
    // Post API-- to create / add Posts to all Posts
    app.post("/post", async (req, res) => {
      const newPost = req.body;
      const result = await postCollection.insertOne(newPost);
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
    // Find email which role is admin
    app.get("/admin/:email", async (req, res) => {
      const email = req.params.email;
      const user = await userCollection.findOne({ email: email });
      const isAdmin = user.role === "admin";
      res.send({ admin: isAdmin });
    });
    // UPsert admin field to user Collection ANd denied unauthorized access by verifyJWT
    app.put("/user/admin/:email", verifyJWT, async (req, res) => {
      const email = req.params.email;
      const requester = req.decoded.email;
      const requesterAccount = await userCollection.findOne({
        email: requester,
      });

      if (requesterAccount.role === "admin") {
        const filter = { email: email };
        const updateDoc = {
          $set: { role: "admin" },
        };
        const result = await userCollection.updateOne(filter, updateDoc);
        res.send(result);
      } else {
        req.status(403).send({ message: "forbidden" });
      }
    });
    // Get All orders user basis data for Dashboard
    app.get("/order", verifyJWT, async (req, res) => {
      //  je shdhu mstro login korsa ache tar info onujayi tar ordergulo dekhabe.
      const email = req.query.email;
      const decodedEmail = req.decoded.email;
      if (email === decodedEmail) {
        const query = { email: email };
        const orders = await shippingCollection.find(query).toArray();
        return res.send(orders);
      } else {
        return res.status(403).send({ message: "Forbidden Access" });
      }
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
app.get("/hero", (req, res) => {
  res.send("Auto Point is Running on Heroku!");
});

app.listen(port, () => {
  console.log(`Auto App listening on port ${port}`);
});
