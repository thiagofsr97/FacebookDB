const express = require('express');
const app = express();         
const bodyParser = require('body-parser');
const port = 3000; //porta padrão
const mysql = require('mysql');
const moment = require('moment');
var connection = require('./connection');

connection.connect(function(err){
  if(err) return console.log(err);
  console.log('Connected to DB.');
})


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

const router = express.Router();


// test message at the root of endpoint to check wether the service is up and running
//setting root router

router.get('/', (req, res) => res.json({ message: 'DB up and running!' }));

app.use('/', router);
app.use(require('./groupRoutes'));
app.use(require('./usersRoutes'));
app.use(require('./postRoutes'));
app.use(require('./friendRoutes'))
app.use(require('./commentRoutes'));
app.listen(port);

  