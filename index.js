const express = require('express');
const app = express();
const Joi = require('joi');
const mongodb = require('mongodb');

app.use(express.json());

var MongoClient = mongodb.MongoClient;
var url = 'mongodb://root:root@mongo:27017/admin';

let database;
MongoClient.connect(url, (err, db)=>{
  if (err) throw err;
  console.log('Mongodb connected...');
  db.db('admin').addUser('myuser', 'password',{'roles':[{'role':'readWrite', 'db':'mydb'}]}, (err, res)=>{
      if(err){
          if(err.codeName === 'DuplicateKey')
            console.log('user exist');
          else
            throw err;
      }else
        console.log('User added!');
      database = db.db('mydb');
      database.createCollection('customers', (err, res)=>{
        if (err) throw err;
        console.log('Collection initialized!');
      });
  });
});

app.get('/', (req, res) => {
    res.send('Hello world');
});

app.get('/customer', (req, res) => {
    var mysort = { name: -1 };
    database.collection("customers").find().sort(mysort).toArray((mErr, mRes)=>{
        if (mErr) return res.send(mErr);
        console.log(mRes);
        res.send(mRes);
    });
});

app.get('/customer/:name', (req, res) => {
    query = {name: req.params.name};
    database.collection("customers").find(query).toArray((mErr, mRes)=>{
        if (mErr) return res.send(mErr);
        console.log(mRes);
        res.send(mRes);
    });
});

app.post('/customer', (req, res) => {
    let myobj = { name: req.body.name, address: req.body.address };
    database.collection("customers").insertOne(myobj, (mErr, mRes)=>{
        if (mErr) return res.send(mErr);
        let msg = `${req.body.name} inserted\n`;
        console.log(msg);
        res.send(msg);
    });
});

app.put('/customer/:name', (req, res) => {
    let query = { name: req.params.name};
    let newValue = {$set: {address: req.body.address }};
    database.collection("customers").updateOne(query, newValue, (mErr, mRes)=>{
        if (mErr) return res.send(mErr);
        let msg = `${mRes.matchedCount} matched and ${mRes.modifiedCount} updated\n`;
        console.log(msg);
        res.send(msg);
    });
});

app.delete('/customer/:name', (req, res) => {
    query = {name: req.params.name};
    database.collection("customers").deleteMany(query, (mErr, mRes)=>{
        if (mErr) return res.send(mErr);
        console.log(mRes);
        res.send(`${mRes.deletedCount} deleted\n`);
    });
});

function buildJsObj(obj) {
    let jsObj = {};
    Object.keys(obj).forEach(key => {
        jsObj[key] = obj[key];
    });
    return jsObj;
}

function validateMessage(message){
    const schema = {
        receiver: Joi.string().min(3).required(),
        message: Joi.string().max(30).required
    }
    return Joi.validate(message, schema);
}

const port = process.env.PORT || 3000;
app.listen(port, ()=>console.log(`Listening on port ${port}...`));
