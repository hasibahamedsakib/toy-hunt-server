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
    // await client.connect();

    // Database Collection
    const DB = client.db("TOY-HUNT-PLACE");
    const toyCollection = DB.collection("toys");

    // get toy-gallery
    const toyGallery = DB.collection("gallery");

    app.get("/gallery", async (req, res) => {
      const result = await toyGallery.find().toArray();
      res.send(result);
    });

    // get all toys
    app.get("/toys", async (req, res) => {
      const result = await toyCollection
        .find({})
        .limit(20)
        .sort({ createdAt: -1 })
        .toArray();
      res.send(result);
    });

    // get toy by id
    app.get("/toy/:id", async (req, res) => {
      const result = await toyCollection.findOne({
        _id: new ObjectId(req.params.id),
      });
      res.send(result);
    });

    // get toy by Category
    app.get("/toys/:category", async (req, res) => {
      if (
        req.params.category == "sports" ||
        req.params.category == "truck" ||
        req.params.category == "police"
      ) {
        const result = await toyCollection
          .find({ subCategory: req.params.category })
          .toArray();
        res.send(result);
      }
    });

    // search toy by toy-name
    const indexKey = { toyName: 1 };
    const indexOption = { name: "toyName" };
    toyCollection.createIndex(indexKey, indexOption);

    app.get("/searchToy/:toyName", async (req, res) => {
      const toyName = req.params.toyName;
      const query = { toyName: { $regex: toyName, $options: "i" } };
      const searchResult = await toyCollection.find(query).toArray();
      res.send(searchResult);
    });

    // get my-toy and sorting by price
    app.get("/myToys", async (req, res) => {
      let query = {};
      let sort = {};

      if (req.query?.email) {
        query = { sellerEmail: req.query.email };
      }
      if (req.query?.sort) {
        let sortValue = req?.query?.sort == "true" ? 1 : -1;
        sort = { price: sortValue };
      }
      const result = await toyCollection
        .find(query)
        .sort(sort)
        .collation({ locale: "en_US", numericOrdering: true })
        .toArray();

      res.send(result);
    });

    //  create a new toy
    app.post("/toys", async (req, res) => {
      const body = req.body;
      body.createdAt = new Date();
      const result = await toyCollection.insertOne(body);
      res.send(result);
    });

    // update my toys
    app.put("/toys/:id", async (req, res) => {
      const id = req.params.id;
      const body = req.body;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          toyName: body.toyName,
          price: body.price,
          quantity: body.quantity,
          description: body.description,
        },
      };
      const result = await toyCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    // delete a toy
    app.delete("/toys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.deleteOne(query);
      res.send(result);
    });
    // await client.db("admin").command({ ping: 1 });
    // console.log(
    //   "Pinged your deployment. You successfully connected to MongoDB!"
    // );
  } finally {
  }
}
run().catch(console.dir);

// server listening
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
