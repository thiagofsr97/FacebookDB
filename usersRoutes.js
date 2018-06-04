var express = require('express');
var router = express.Router();
var connection = require('../nodemysql/connection');
const moment = require('moment');


//--------------------------------Get User signed up in fb --------------------------//

router.get('/users',(req,res) =>{
    execSQLQuery('SELECT * FROM UserProfile',res);
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
    execSQLQuery(sqlQuery,res);
})


//-------------------------- Update Profile Picture ----------------------------//

router.post('/user/:id?/update-profile',(req,res)=>{
    sqlQuery = 'UPDATE UserProfile ' +
    `SET UserProfile.ProfilePicture = '${req.body.profile_pic}' `+
    `WHERE UserProfile.idUserProfile = '${req.params.id}'`;
    execSQLQuery(sqlQuery,res);

})


//------------------------------- Get list of friends from a given user -------------------//
router.get('/user/:id?/friends',(req,res)=>{
    var sqlQuery = 'SELECT UserProfile.*\n' +
     'FROM Friendship\n'+ 
    'JOIN UserProfile ON Friendship.UserProfile_idUserProfile = UserProfile.idUserProfile\n' +
    `WHERE Friendship.UserProfile_idUserProfile1 = '${req.params.id}'\n` +
    'UNION SELECT UserProfile.* FROM Friendship\n' +
    'JOIN UserProfile ON Friendship.UserProfile_idUserProfile1 = UserProfile.idUserProfile\n' +
    `WHERE Friendship.UserProfile_idUserProfile = '${req.params.id}'`;
    execSQLQuery(sqlQuery,res);
  
  })




//-----------------------------Sending a friend request to a user -------------------------//

router.post('/user/:id?/request',(req,res)=>{
    const id_requester = req.body.user_id;
    const timeStamp = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
    execSQLQuery(`INSERT INTO FriendRequest(idUserProfile_1, idUserProfile_2,Date) VALUES('${id_requester}','${req.params.id}','${timeStamp}')`, res);
   
  });

//----------------------------- Accepting a friend request from a user -------------------//
router.post('/user/:current_user_id?/requests/accept',(req,res)=>{
    const current_user_id = req.params.current_user_id;
    const user_friend_id = req.body.user_friend_id;
    const sqlQuery_1 = 'INSERT INTO Friendship (UserProfile_idUserProfile, UserProfile_idUserProfile1) VALUES '+
    `('${current_user_id}', '${user_friend_id}')`;
    const sqlQuery_2 = 'UPDATE UserProfile SET UserProfile.NumberOfFriends = UserProfile.NumberOfFriends + 1 ' +
    `WHERE (UserProfile.idUser = '${current_user_id}') OR (UserProfile.idUser = '${user_friend_id}');`;
    const sqlQuery_3 = 'DELETE FROM FriendRequest WHERE '+ 
    `(idUserProfile_1 = '${current_user_id}' AND idUserProfile_2 = '${user_friend_id}') OR (idUserProfile_1 = '${user_friend_id}' AND idUserProfile_2 = '${current_user_id}');`

});


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
                    json = { success: false, message: 'database error',err:error};
                    res.json(json);
                    throw err;

                });d
            }
            sqlQuery = 'UPDATE Post '+
            'SET Post.NumberOfComments = Post.NumberOfComments + 1 ' +
            `WHERE (Post.idPost = ${post_id}) && (Post.UserProfile_idUserProfile_postOwner = '${user_id}');`
            connection.query(sqlQuery,function(err,result){
                if(err){
                    connection.rollback(function(){
                        json = {sucess:false, message: 'database error',err:error};
                        res.json(json);
                        throw err;
                    });
                }

            });

            connection.commit(function(err){
                if(err){
                    connection.rollback(function(){
                        json = {sucess:false, message: 'database error',err:error};
                        res.json(json);
                        throw err;
                    });
                }
                res.json(result);
                console.log('Transaction Complete.');
            });
        });







    });


});

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