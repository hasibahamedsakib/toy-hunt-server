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

    app.post("/toys", async (req, res) => {
      const body = req.body;
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
