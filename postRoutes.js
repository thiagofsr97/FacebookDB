const express = require('express');
const router = express.Router();
const connection = require('../nodemysql/connection');
const moment = require('moment');
const utils = require('./Utils');

//------------------------------- Act of posting in user's mural----------------------------------------//
router.post('/user/:id?/post',(req,res)=>{
    const id_user = req.body.id_poster;
    const id_user_mural = req.params.id;
    const visibility = req.body.visibility == 'public'? 1:0;
    const text = req.body.text;
    
    doPost('users',id_user,id_user_mural,visibility,text,req,res);
  
  })

//------------------------------- Act of deleting a post in user's mural----------------------------------------//

router.post('/user/:user_id?/post/:post_id?/delete',(req,res)=>{
    const post_owner = req.body.post_owner;
    var sqlQuery_1 = 'DELETE FROM Attachments WHERE '+
    `(Attachments.Post_idPost='${req.params.post_id}') AND (Attachments.Post_UserProfile_idUserProfile='${post_owner}');`;
    var sqlQuery_2 = `DELETE FROM Post WHERE (Post.UserProfile_idUserProfile_postOwner = '${post_owner}') `+
    `AND (Post.UserProfileMural_idUserProfile = '${req.params.user_id}') AND (Post.idPost = '${req.params.post_id}');`;

    connection.beginTransaction(function(err) {
        if (err) { throw err; }
        connection.query(sqlQuery_1, function(err, result) {
          if (err) { 
            connection.rollback(function() {
                res.json(utils.jsonBuilder(err));
                throw err;
            });
          }
       
          connection.query(sqlQuery_2,function(err, result) {
            if (err) { 
              connection.rollback(function() {
                res.json(utils.jsonBuilder(err));
                throw err;
              });
            }  
            connection.commit(function(err) {
              if (err) { 
                connection.rollback(function() {
                    res.json(utils.jsonBuilder(err));
                    throw err;
                });
              }
              res.json(utils.jsonBuilder(err));
              console.log('Transaction Complete.');
            });
          });
        });
      });
});

  
//------------------------------- Act of posting in group's mural----------------------------------------//
router.post('/group/:id?/post',(req,res)=>{
    const id_user = req.body.id_poster;
    const id_group_mural = req.params.id;
    const visibility = req.body.visibility == 'public'? 1:0;
    const text = req.body.text;
    
    doPost('group',id_user,id_group_mural,visibility,text,req,res);
  
  })  
  
 
//---------------------------- Get posts from a given user -------------------------------//
router.get('/user/:id?/allposts',(req,res)=>{
    sqlQuery = 'SELECT Post.* FROM Post\n' +
    `WHERE Post.UserProfile_idUserProfile_postOwner = '${req.params.id}'\n` + 
    'ORDER BY Post.idPost DESC';
    utils.querySQL(sqlQuery,res);
  })
  
  

//----------------------------Get posts from a user's mural -------------------------//
router.get('/user/:mural_user_id?/posts',(req,res)=>{
    const mural_id = req.params.mural_user_id;
    sqlQuery = `SELECT Post.* FROM Post WHERE Post.UserProfileMural_idUserProfile = '${mural_id}' `+
    'ORDER BY Post.idPost DESC';
    utils.querySQL(sqlQuery,res);
})  

//----------------------------Get posts from a group's mural -------------------------//
router.get('/group/:mural_group_id?/posts',(req,res)=>{
    const mural_id = req.params.mural_group_id;
    sqlQuery = `SELECT Post.* FROM Post WHERE Post.GroupsMural_idGroups = '${mural_id}' `+
    'ORDER BY Post.idPost DESC';
    utils.querySQL(sqlQuery,res);
})


  function doPost(location,id_user,id_mural,visibility,text,req,res){
    var sqlQuery = ''; 
    if(location == 'group'){
        sqlQuery = 'INSERT INTO Post (Text, PostTime, NumberOfComments, Visibility, UserProfile_idUserProfile_postOwner,GroupsMural_idGroups) VALUES'
    + `('${text}', '${moment(Date.now()).format('YYYY-MM-DD HH:mm:ss')}','0', '${visibility}', '${id_user}','${id_mural}');`;
    }else{
        sqlQuery = 'INSERT INTO Post (Text, PostTime, NumberOfComments, Visibility, UserProfile_idUserProfile_postOwner,UserProfileMural_idUserProfile) VALUES'
    + `('${text}', '${moment(Date.now()).format('YYYY-MM-DD HH:mm:ss')}','0', '${visibility}', '${id_user}','${id_mural}');`;
    }
    connection.beginTransaction(function(err) {
        if (err) { throw err; }
        connection.query(sqlQuery, function(err, result) {
          if (err) { 
            connection.rollback(function() {
                res.json(utils.jsonBuilder(err));
                throw err;
            });
          }

          if(req.body.attachment_type != undefined && req.body.attachment_path!=undefined){
              var id_post = result.insertId;
            sqlQuery = 'INSERT INTO Attachments (Type, Path, Post_idPost, Post_UserProfile_idUserProfile)' +
                `VALUES ('${req.body.attachment_type}','${req.body.attachment_path}','${id_post}','${id_user}')`;
                
            connection.query(sqlQuery,function(err,result){
                if(err){
                    connection.rollback(function(err,result) {
                        res.json(utils.jsonBuilder(err));
                        throw err;
                    });

                }
                
            })
          }
          connection.commit(function(err){
            if (err) { 
                connection.rollback(function() {
                  throw err;
                });
              }
              res.json(utils.jsonBuilder(err));
              console.log('Transaction Complete.');
          });
        });
    });
  }





  module.exports = router;