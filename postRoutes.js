const express = require('express');
const router = express.Router();
const connection = require('./connection');
const moment = require('moment');
const utils = require('./Utils');

//------------------------------- Act of posting in user's mural----------------------------------------//
router.post('/user/:id?/mural/post',(req,res)=>{
    const id_user = req.body.user_id_poster;
    const id_user_mural = req.params.id;
    const visibility = req.body.visibility == 'public'? 1:0;
    const text = req.body.text;
    
    doPost('users',id_user,id_user_mural,visibility,text,req,res);
  
  });

//------------------------------- Act of deleting a post ----------------------------------------//

router.post('/post/:post_id?/delete',(req,res)=>{
    const sqlQuery_1 = 'DELETE FROM Attachments WHERE '+
    `(Attachments.Post_idPost='${req.params.post_id}');`;
    const sqlQuery_3 = 'DELETE FROM Comments WHERE ' +
    `Post_idPost = '${req.params.post_id}';`;
    const sqlQuery_2 = 'DELETE FROM Responses WHERE ' +
    `(Comments_Post_idPost = '${req.params.post_id}');`;
    const sqlQuery_4 = `DELETE FROM Post WHERE(Post.idPost = '${req.params.post_id}');`;

    utils.queryTransaction([sqlQuery_1,sqlQuery_2,sqlQuery_3,sqlQuery_4],res);
});  
//------------------------------- Act of posting in group's mural----------------------------------------//
router.post('/group/:id?/mural/post',(req,res)=>{
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
  
  
router.get('/post/:post_id?/attachments/',(req,res)=>{
    const post_id = req.params.post_id;
    const sqlQuery = `SELECT Type,Path FROM Attachments WHERE Post_idPost = '${post_id}';`;
    utils.querySQL(sqlQuery,res);
});
//----------------------------Get posts from a user's mural -------------------------//
router.get('/user/:mural_user_id?/mural/posts',(req,res)=>{
    const mural_id = req.params.mural_user_id;
    sqlQuery = `SELECT Post.* FROM Post WHERE Post.UserProfileMural_idUserProfile = '${mural_id}' `+
    'ORDER BY Post.idPost DESC';
    utils.querySQL(sqlQuery,res);
})  

//----------------------------Get posts from a group's mural -------------------------//
router.get('/group/:mural_group_id?/mural/posts',(req,res)=>{
    const mural_id = req.params.mural_group_id;
    sqlQuery = `SELECT Post.* FROM Post WHERE Post.GroupsMural_idGroups = '${mural_id}' `+
    'ORDER BY Post.idPost DESC';
    utils.querySQL(sqlQuery,res);
})

//----------------------------Get posts from a user's feednews -------------------------//
router.get('/user/:user_id?/feed',(req,res)=>{  
    const sqlQuery_1 = '(SELECT Post.* FROM Post ' +
    `INNER JOIN Friendship ON (Friendship.UserProfile_idUserProfile = '${req.params.user_id}') `+
    'WHERE (Friendship.UserProfile_idUserProfile1 = Post.UserProfile_idUserProfile_postOwner AND Post.UserProfileMural_idUserProfile = Post.UserProfile_idUserProfile_postOwner)) ';
    
    const sqlQuery_2 = 'UNION (SELECT Post.* FROM Post ' +
    `INNER JOIN Friendship ON (Friendship.UserProfile_idUserProfile1 = '${req.params.user_id}') ` +
    'WHERE (Friendship.UserProfile_idUserProfile = Post.UserProfile_idUserProfile_postOwner AND Post.UserProfileMural_idUserProfile = Post.UserProfile_idUserProfile_postOwner)) ';
    
    const sqlQuery_3 = 'UNION (SELECT Post.* FROM Post WHERE Post.Visibility = 1 AND Post.UserProfile_idUserProfile_postOwner = Post.UserProfileMural_idUserProfile) ';
    
    const sqlQuery_4 = `UNION (SELECT Post.* FROM Post WHERE Post.UserProfileMural_idUserProfile = '${req.params.user_id}') `;

    const sortedBy = 'ORDER BY idPost DESC;'
    utils.querySQL(sqlQuery_1 + sqlQuery_2 + sqlQuery_3 + sqlQuery_4 + sortedBy,res);
    
     
});


  function doPost(location,id_user,id_mural,visibility,text,req,res){
    var sqlQuery = ''; 
    if(location == 'group'){
        sqlQuery = 'INSERT INTO Post (Text, PostTime, NumberOfComments, Visibility, UserProfile_idUserProfile_postOwner,GroupsMural_idGroups,	NumberOfLikes) VALUES'
    + `('${text}', '${moment(Date.now()).format('YYYY-MM-DD HH:mm:ss')}','0', '${visibility}', '${id_user}','${id_mural}','0');`;
    }else{
        sqlQuery = 'INSERT INTO Post (Text, PostTime, NumberOfComments, Visibility, UserProfile_idUserProfile_postOwner,UserProfileMural_idUserProfile,	NumberOfLikes) VALUES'
    + `('${text}', '${moment(Date.now()).format('YYYY-MM-DD HH:mm:ss')}','0', '${visibility}', '${id_user}','${id_mural}','0');`;
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

//------------------------------- Change post's visibility in user's mural----------------------------------------//

router.post('/post/:post_id?/visibility',(req,res)=>{
    const visibility = req.body.visibility == 'public'?1:0;
    const sqlQuery = `UPDATE Post SET Visibility = '${visibility}' WHERE Post.idPost = '${req.params.post_id}';`
    utils.queryPost(sqlQuery,res);
});


  module.exports = router;