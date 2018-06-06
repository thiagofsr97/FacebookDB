var express = require('express');
var router = express.Router();
var connection = require('../nodemysql/connection');
const moment = require('moment');
const utils = require('./Utils');

// -------------------------- Get groups existing in fb ------------------------------------------//

router.get('/groups',(req,res) => {
    utils.querySQL('SELECT * FROM Groups',res);
  })
  
  
//--------------------------- Get users that participate of a given group -------------------------//
  router.get('/groups/:id?/members',(req,res) =>{
    sqlQuery = 'SELECT UserProfile.* '+
    'FROM Participation ' +
    'JOIN UserProfile on UserProfile.idUserProfile = Participation.UserProfile_idUserProfile '+
    'WHERE Participation.Groups_idGroups=' + req.params.id;      
    utils.querySQL(sqlQuery,res);
  })
  
  //------------------------ Get admins users from a group or all of the groups -----------------//
//to do


  module.exports = router;