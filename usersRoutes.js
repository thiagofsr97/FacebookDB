var express = require('express');
var router = express.Router();
var connection = require('./connection');
const moment = require('moment');
const utils = require('./Utils');


//--------------------------------Get User signed up in fb --------------------------//

router.get('/users',(req,res) =>{
    utils.querySQL('SELECT * FROM UserProfile',res);
  } )



//------------------------------- List users to a given user except blocked --------------------------//

router.get('/user/:user_id?/list/users',(req,res) =>{
    const sqlQuery = 'SELECT UserProfile.* FROM UserProfile '+
    'WHERE (UserProfile.idUserProfile NOT IN ' +
    '(SELECT UserProfile.idUserProfile FROM BlockingUser ' +
     'JOIN UserProfile ON BlockingUser.UserProfile_idUserProfile = UserProfile.idUserProfile ' +
     ` WHERE BlockingUser.UserProfile_idUserProfile1 = '${req.params.user_id}')) AND (UserProfile.idUserProfile !='${req.params.user_id}');`;
 
    
    
    utils.querySQL(sqlQuery,res);
  } );

//------------------------------- List groups to a given user except blocked --------------------------//

router.get('/user/:user_id?/list/groups',(req,res) =>{
    const sqlQuery = 'SELECT Groups.* FROM Groups WHERE ' +
    'Groups.idGroups NOT IN ' +
    '(SELECT Groups.idGroups FROM Blocked ' +
    `JOIN Groups ON Blocked.Groups_idGroups = Groups.idGroups WHERE Blocked.UserProfile_idUserProfile = '${req.params.user_id}');`;
 
    
    
    utils.querySQL(sqlQuery,res);
  } );

//--------------------------------Get UserProfile information--------------------------//
router.get('/user/:user_id?',(req,res)=>{
    utils.querySQL(`SELECT * FROM UserProfile WHERE idUserProfile = '${req.params.user_id}';`,res);
})

//----------------------------------Create a new user in fb -------------------------//

router.post('/user/signup',(req,res)=>{
    const user_first_name = req.body.first_name;
    const user_last_name = req.body.last_name;
    const user_email = req.body.email;
    const user_password = req.body.password;

    var sqlQuery = '';
    if(req.body.profile_pic != undefined){
        sqlQuery = 'INSERT INTO UserProfile (FirstName, LastName, Email, Password, ProfilePicture,NumberOfFriends,Date) '+
    `VALUES ('${user_first_name}', '${user_last_name}', '${user_email}', '${user_password}', '${req.body.profile_pic}', '0','${moment(Date.now()).format('YYYY-MM-DD HH:mm:ss')}');`;
    }else{
        sqlQuery = 'INSERT INTO UserProfile (FirstName, LastName, Email, Password, NumberOfFriends,Date) '+
    `VALUES ('${user_first_name}', '${user_last_name}', '${user_email}', '${user_password}', '0','${moment(Date.now()).format('YYYY-MM-DD HH:mm:ss')}');`;
    }
    utils.queryPost(sqlQuery,res);
})


//-------------------------- Update Profile Picture ----------------------------//

router.post('/user/:id?/update-profile',(req,res)=>{
    sqlQuery = 'UPDATE UserProfile ' +
    `SET UserProfile.ProfilePicture = '${req.body.profile_pic}' `+
    `WHERE UserProfile.idUserProfile = '${req.params.id}'`;
    utils.queryPost(sqlQuery,res);

})

//----------------------------------- List groups of a user ----------------------------//
router.get('/user/:id?/groups',(req,res)=>{
    const sqlQuery = `SELECT Groups.* FROM Participation ` +
    `JOIN Groups ON (Participation.Groups_idGroups = Groups.idGroups) `+
    `WHERE Participation.UserProfile_idUserProfile = '${req.params.id}';`;
    utils.querySQL(sqlQuery,res);
});

  module.exports = router;