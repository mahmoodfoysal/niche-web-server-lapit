const express = require('express')
require('dotenv').config()
const cors = require('cors')
const { MongoClient, ServerApiVersion } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

const app = express()
const port = process.env.PORT || 5000;

app.use(cors())
app.use(express.json())

// mongodb connection here 
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qwkqk.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
      await client.connect();
      const database = client.db("niche_website");
      const productsCollection = database.collection("products");
      const orderCollection = database.collection("orders");
      const usersCollection = database.collection("users");
      const ratingCollection = database.collection("rating");
      
    //   all post method declare here 

    app.post('/products', async(req, res) => {
        const addProduct = req.body;
        const result = await productsCollection.insertOne(addProduct);
        res.json(result);

    })

    app.post('/order', async(req, res) => {
        const order = req.body;
        order.date = new Date().toLocaleDateString()
        const result = await orderCollection.insertOne(order);
        res.send(result);
    })

    // rating posting 
    app.post('/rating', async(req, res) => {
      const rating = req.body;
      const result = await ratingCollection.insertOne(rating);
      res.send(result);
    })

    // all get method declare here 
    app.get('/products', async(req, res) => {
        const products = productsCollection.find({})
        const result = await products.toArray()
        res.send(result);
    })

    app.get('/productDetails/:id', async(req, res) => {
        const id= req.params.id;
        const query = {_id: ObjectId(id)}
        const result = await productsCollection.findOne(query);
        res.json(result)
    })

    app.get('/manageOrders', async(req, res) => {
      const manageOrder = orderCollection.find({});
      const result = await manageOrder.toArray();
      res.send(result);
    })

    // rating api 
    app.get('/rating', async(req, res) => {
      const rating = ratingCollection.find({})
      const result = await rating.toArray()
      res.send(result);
  })

    // customers orders show bt email id 
    app.get('/manageOrders/:email', async (req, res) => {
      const userEmail = req.params.email;
      const filter = { userEmail: userEmail };
      const orders = orderCollection.find(filter);
      const result = await orders.toArray();
      res.json(result);
    });

    // get user data for check admin 
    app.get('/users/:email', async(req, res) => {
      const email = req.params.email;
      const query = {email: email};
      const user = await usersCollection.findOne(query);
      let isAdmin = false;
      if(user?.role === 'admin') {
        isAdmin = true;
      }
      res.json({admin: isAdmin});
    })

    // all put operation are here 
    app.put('/users', async(req, res) => {
      const user = req.body;
      const filter = {email: user.email};
      const options = {upsert: true};
      const updateDoc = {$set: user};
      const result = await usersCollection.updateOne(filter, updateDoc, options);
      res.json(result);
    })

    // change order status 
    app.put('/manageOrders/:id', async(req, res) => {
      const id = req.params.id;
      const status = req.body;
      const filter = {_id: ObjectId(id)};
      const options = {upsert: true};
      const updateDoc = {
        $set: {
          orderStatus: status.status
        }
      };
      const result = await orderCollection.updateOne(filter, updateDoc, options);
      res.json(result);
    })

    // make admin 
    app.put('/users/admin', async(req, res) => {
      const user = req.body
      const filter = {email: user.email};
      const updateDoc = {$set: {role: 'admin'}};
      const result = await usersCollection.updateOne(filter, updateDoc)
      res.json(result);
    })



    // all delete are here 

    // order delete 
    app.delete('/manageOrders/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id: ObjectId(id)}
      const result = await orderCollection.deleteOne(query);
      res.json(result);
    })

    // product delete 
    app.delete('/products/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id: ObjectId(id)}
      const result = await productsCollection.deleteOne(query)
      res.json(result);
    })

        

    } finally {
    //   await client.close();
    }
  }
  run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('niche website server running')
})

app.listen(port, () => {
  console.log(`Port listening at ${port}`)
})