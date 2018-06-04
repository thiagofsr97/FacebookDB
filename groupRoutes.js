var express = require('express');
var router = express.Router();
var connection = require('../nodemysql/connection');
const moment = require('moment');

// -------------------------- Get groups existing in fb ------------------------------------------//

router.get('/groups',(req,res) => {
    execSQLQuery('SELECT * FROM Groups',res);
  })
  
  
//--------------------------- Get users that participate of a given group -------------------------//
  router.get('/groups/:id?/members',(req,res) =>{
    sqlQuery = 'SELECT UserProfile.* '+
    'FROM Participation ' +
    'JOIN UserProfile on UserProfile.idUserProfile = Participation.UserProfile_idUserProfile '+
    'WHERE Participation.Groups_idGroups=' + req.params.id;
      
      execSQLQuery(sqlQuery,res);
  })
  
  //------------------------ Get admins users from a group or all of the groups -----------------//
//to do

  function execSQLQuery(sqlQuery,res){
    connection.query(sqlQuery,function(error,results,fields){
      if(error){
        json = { success: false, message: 'database error',err:error};
        res.json(json);
      }
      else{
        res.json(results);
      }
      
        console.log('Query executed...');
    });
    
  }

  module.exports = router;