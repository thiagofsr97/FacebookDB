var express = require('express');
var router = express.Router();
var connection = require('../nodemysql/connection');
const moment = require('moment');
const utils = require('./Utils');


//--------------------------------Get User signed up in fb --------------------------//

router.get('/users',(req,res) =>{
    utils.querySQL('SELECT * FROM UserProfile',res);
  } )


//----------------------------------Create a new user in fb -------------------------//

router.post('/user/signup',(req,res)=>{
    const user_first_name = req.body.first_name;
    const user_last_name = req.body.last_name;
    const user_email = req.body.email;
    const user_password = req.body.password;

    var sqlQuery = '';
    if(req.body.user_profile_pic != undefined){
        sqlQuery = 'INSERT INTO UserProfile (FirstName, LastName, Email, Password, ProfilePicture,NumberOfFriends) '+
    `VALUES ('${user_first_name}', '${user_last_name}', '${user_email}', '${user_password}', '${req.body.user_profile_pic}', '0');`;
    }else{
        sqlQuery = 'INSERT INTO UserProfile (FirstName, LastName, Email, Password, NumberOfFriends) '+
    `VALUES ('${user_first_name}', '${user_last_name}', '${user_email}', '${user_password}', '0');`;
    }
    utils.querySQL(sqlQuery,res);
})


//-------------------------- Update Profile Picture ----------------------------//

router.post('/user/:id?/update-profile',(req,res)=>{
    sqlQuery = 'UPDATE UserProfile ' +
    `SET UserProfile.ProfilePicture = '${req.body.profile_pic}' `+
    `WHERE UserProfile.idUserProfile = '${req.params.id}'`;
    utils.querySQL(sqlQuery,res);

})





// ----------------------------- Commmenting on a post -----------------------------------//

router.post('/user/:id_user?/posts/:id_post?/comment',(req,res)=>{
    const user_id = req.params.id_user;
    const post_id = req.params.id_post;
    const user_commenter_id = req.body.user_id;
    const comment = req.body.text;
    var sqlQuery = `INSERT INTO Comments (NumberOfResponses, Post_idPost, Post_UserProfile_idUserProfile_postOwner, UserProfile_idUserProfile_commenter) VALUES ('0', '${post_id}', '${user_id}', '${user_commenter_id}');`
    
    connection.beginTransaction(function(err){
        if(err){throw err;}
        connection.query(sqlQuery,function(err,result){
            if(err){
                connection.rollback(function(){
                    
                    res.json(utils.jsonBuilder(err));
                    throw err;

                });
            }
            sqlQuery = 'UPDATE Post '+
            'SET Post.NumberOfComments = Post.NumberOfComments + 1 ' +
            `WHERE (Post.idPost = ${post_id}) && (Post.UserProfile_idUserProfile_postOwner = '${user_id}');`
            connection.query(sqlQuery,function(err,result){
                if(err){
                    connection.rollback(function(){
                        res.json(utils.jsonBuilder(err));
                        throw err;
                    });
                }

            });

            connection.commit(function(err){
                if(err){
                    connection.rollback(function(){
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


  module.exports = router;