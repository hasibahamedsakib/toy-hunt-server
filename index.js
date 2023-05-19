const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();

// middleware
app.use(cors());
app.use(express.json());

// port
const PORT = process.env.PORT || 3001;
app.get("/", (req, res) => {
  res.send("<h1>This is home page.</h1>");
});

// mongodb

const uri = process.env.DB_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    // Database Collection
    const DB = client.db("TOY-HUNT-PLACE");
    const toyCollection = DB.collection("toys");

    // get toy-gallery
    const toyGallery = DB.collection("gallery");

    app.get("/gallery", async (req, res) => {
      const result = await toyGallery.find().toArray();
      res.send(result);
    });
    // get toy-tab
    const toyTab = require("./public/toy-cars.json");
    app.get("/toyTab", (req, res) => {
      res.send(toyTab);
    });

    // get all toys
    app.get("/toys", async (req, res) => {
      // const options = {
      //     projection: {},
      // }
      const result = await toyCollection
        .find({})
        .limit(20)
        .sort({ createdAt: -1 })
        .toArray();
      res.send(result);
    });

    // get my-toy
    app.get("/myToys", async (req, res) => {
      let query = {};
      if (req.query?.email) {
        query = { sellerEmail: req.query.email };
      }
      const result = await toyCollection.find(query).toArray();
      res.send(result);
    });
    //  create a new toy
    app.post("/toys", async (req, res) => {
      const body = req.body;
      body.createdAt = new Date();
      const result = await toyCollection.insertOne(body);
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);

// server listening
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
