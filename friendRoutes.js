var express = require('express');
var router = express.Router();
var connection = require('../nodemysql/connection');
const moment = require('moment');
const utils = require('./Utils');

//------------------------------- Get list of friends from a given user -------------------//
router.get('/user/:id?/friends',(req,res)=>{
    var sqlQuery = 'SELECT UserProfile.* ' +
     'FROM Friendship '+ 
    'JOIN UserProfile ON Friendship.UserProfile_idUserProfile = UserProfile.idUserProfile ' +
    `WHERE Friendship.UserProfile_idUserProfile1 = '${req.params.id}' ` +
    'UNION SELECT UserProfile.* FROM Friendship ' +
    'JOIN UserProfile ON Friendship.UserProfile_idUserProfile1 = UserProfile.idUserProfile ' +
    `WHERE Friendship.UserProfile_idUserProfile = '${req.params.id}'`;
    utils.querySQL(sqlQuery,res);
  
  })


//------------------------------- Get list of users blocked by me -------------------//

router.get('/user/:id?/blocks',(req,res)=>{
    var sqlQuery = 'SELECT UserProfile.* FROM BlockingUser ' + 
    'JOIN UserProfile ON BlockingUser.UserProfile_idUserProfile1 = UserProfile.idUserProfile ' +
    `WHERE BlockingUser.UserProfile_idUserProfile = '${req.params.id}';`;
    utils.querySQL(sqlQuery,res);
})

//------------------------------- Get list of users that blocked me-------------------//

router.get('/user/:id?/blockeds',(req,res)=>{
    const sqlQuery = 'SELECT UserProfile.* FROM BlockingUser ' + 
    'JOIN UserProfile ON BlockingUser.UserProfile_idUserProfile = UserProfile.idUserProfile ' +
    `WHERE BlockingUser.UserProfile_idUserProfile1 = '${req.params.id}';`;
    utils.querySQL(sqlQuery,res);
})

//-----------------------------Sending a friend request to a user -------------------------//

router.post('/user/:id?/request',(req,res)=>{
    const id_requester = req.body.user_id;
    const timeStamp = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
    utils.querySQL(`INSERT INTO FriendRequest(idUserProfile_1, idUserProfile_2,Date) VALUES('${id_requester}','${req.params.id}','${timeStamp}')`, res);
   
  });

//------------------------------ Canceling a friend request to a user ---------------------//
router.post('/user/:id?/request/cancel',(req,res)=>{
    const current_user_id = req.body.user_id;
    const user_friend_id = req.params.id;
    const sqlQuery = `DELETE FROM FriendRequest WHERE (FriendRequest.idUserProfile_1 = '${current_user_id}' AND FriendRequest.idUserProfile_2 = ` +
    `'${user_friend_id}') OR (FriendRequest.idUserProfile_1 = '${user_friend_id}' AND FriendRequest.idUserProfile_2 = '${current_user_id}');`;
    utils.querySQL(sqlQuery,res);
    

});

//-----------------------------Listing friends requests made by me -------------------------//

router.get('/user/:id?/requests/sent',(req,res)=>{
    const sqlQuery = 'SELECT UserProfile.* FROM FriendRequest ' +
    'JOIN UserProfile ON FriendRequest.idUserProfile_2 = UserProfile.idUserProfile ' +
    `WHERE FriendRequest.idUserProfile_1 = '${req.params.id}'`;
    utils.querySQL(sqlQuery,res);
})

//-----------------------------Listing friends requests received by me -------------------------//

router.get('/user/:id?/requests/received',(req,res)=>{
    const sqlQuery = 'SELECT UserProfile.* FROM FriendRequest ' +
    'JOIN UserProfile ON FriendRequest.idUserProfile_1 = UserProfile.idUserProfile ' +
    `WHERE FriendRequest.idUserProfile_2 = '${req.params.id}'`;
    utils.querySQL(sqlQuery,res);
})

//----------------------------- Accepting a friend request from a user -------------------//
router.post('/user/:current_user_id?/requests/accept',(req,res)=>{
    const current_user_id = req.params.current_user_id;
    const user_friend_id = req.body.user_friend_id;
    const sqlQuery_1 = 'INSERT INTO Friendship (UserProfile_idUserProfile, UserProfile_idUserProfile1) VALUES '+
    `('${current_user_id}', '${user_friend_id}')`;
    const sqlQuery_2 = 'UPDATE UserProfile SET UserProfile.NumberOfFriends = UserProfile.NumberOfFriends + 1 ' +
    `WHERE (UserProfile.idUserProfile = '${current_user_id}') OR (UserProfile.idUserProfile = '${user_friend_id}');`;
    const sqlQuery_3 = 'DELETE FROM FriendRequest WHERE '+ 
    `(idUserProfile_1 = '${current_user_id}' AND idUserProfile_2 = '${user_friend_id}') OR (idUserProfile_1 = '${user_friend_id}' AND idUserProfile_2 = '${current_user_id}');`

    utils.queryTransaction([sqlQuery_1,sqlQuery_2,sqlQuery_3],res);
});

//------------------------------ Denying a friend request from a user ---------------------//
router.post('/user/:current_user_id?/requests/deny',(req,res)=>{
    const current_user_id = req.params.current_user_id;
    const user_friend_id = req.body.user_friend_id;
    const sqlQuery = `DELETE FROM FriendRequest WHERE (FriendRequest.idUserProfile_1 = '${current_user_id}' AND FriendRequest.idUserProfile_2 = ` +
    `'${user_friend_id}') OR (FriendRequest.idUserProfile_1 = '${user_friend_id}' AND FriendRequest.idUserProfile_2 = '${current_user_id}');`;
    utils.querySQL(sqlQuery,res);
    

});


//------------------------------ Unmake friendship with a user ---------------------//
router.post('/user/:id?/unfriend',(req,res)=>{
    const current_user_id = req.body.user_id;
    const unfriend_id = req.params.id;
    const sqlQuery_1 = `DELETE FROM Friendship WHERE (Friendship.UserProfile_idUserProfile = '${current_user_id}' AND Friendship.UserProfile_idUserProfile1 = '${unfriend_id}') `+
    `OR (Friendship.UserProfile_idUserProfile = '${unfriend_id}' AND Friendship.UserProfile_idUserProfile1 = '${current_user_id}');`;
    const sqlQuery_2 = `UPDATE UserProfile SET NumberOfFriends = NumberOfFriends - 1 ` +
    `WHERE idUserProfile = '${current_user_id}' OR idUserProfile = '${unfriend_id}';`; 

    utils.queryTransaction([sqlQuery_1,sqlQuery_2],res);

})

//------------------------------ Blocking a user ----------------------------//

router.post('/user/:id?/block',(req,res)=>{
    const current_user_id = req.body.user_id;
    const user_blocked = req.params.id;
    const sqlQuery_1 = `DELETE FROM Friendship WHERE (Friendship.UserProfile_idUserProfile = '${current_user_id}' AND Friendship.UserProfile_idUserProfile1 = '${user_blocked}') `+
    `OR (Friendship.UserProfile_idUserProfile = '${user_blocked}' AND Friendship.UserProfile_idUserProfile1 = '${current_user_id}');`;
    const sqlQuery_2 = `UPDATE UserProfile SET NumberOfFriends = NumberOfFriends - 1 ` +
    `WHERE idUserProfile = '${current_user_id}' OR idUserProfile = '${user_blocked}';`; 
    const sqlQuery_3 = `INSERT INTO BlockingUser (UserProfile_idUserProfile, UserProfile_idUserProfile1) VALUES ('${current_user_id}', '${user_blocked}');`;
    utils.queryTransaction([sqlQuery_1,sqlQuery_2,sqlQuery_3],res);

});


//------------------------------ Unblocking a user ----------------------------//
router.post('/user/:id?/unblock',(req,res)=>{
    const current_user_id = req.body.user_id;
    const user_blocked = req.params.id;
    sqlQuery = `DELETE FROM BlockingUser WHERE (BlockingUser.UserProfile_idUserProfile = '${current_user_id}' AND `
    +`BlockingUser.UserProfile_idUserProfile1 = '${user_blocked}');`;    
    utils.querySQL(sqlQuery,res);   

});



module.exports = router;