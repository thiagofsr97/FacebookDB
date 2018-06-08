var express = require('express');
var router = express.Router();
var connection = require('../nodemysql/connection');
const moment = require('moment');
const utils = require('./Utils');

// -------------------------- Get groups existing in fb ------------------------------------------//

router.get('/groups',(req,res) => {
    utils.querySQL('SELECT * FROM Groups',res);
  })


// ----------------------------------- Creates a group in fb -------------------------------------//
router.post('/group/create',(req,res)=>{
  const group_name = req.body.name;
  const group_description = req.body.description;
  const user_creator_id = req.body.user_creator_id;
  const isThereBg = req.body.bg_picture != undefined;
  
  const sqlQuery_1 = 'INSERT INTO Groups(DateCreation, Description, Name, NumberOfMembers' + (isThereBg?`,BackgroundPicture) `:`) `) + 
  `VALUES ('${moment(Date.now()).format('YYYY-MM-DD HH:mm:ss')}','${group_description}','${group_name}','1'`+
  (isThereBg?`,'${req.body.bg_picture}') `:`);`);
  const sqlQuery_2 = 'INSERT INTO Participation(Groups_idGroups, UserProfile_idUserProfile, IsAdmin, IsCreator) VALUES '+
  `((SELECT MAX(Groups.idGroups) FROM Groups),'${user_creator_id}','1','1');`;
  utils.queryTransaction([sqlQuery_1,sqlQuery_2],res);  

});

// ----------------------------------- Update a group's bg picture in fb -------------------------------------//
router.post('/group/:group_id?/update-bg',(req,res)=>{
  const group_id = req.params.group_id;
  const bg_picture = req.body.bg_picture;
  const sqlQuery = `UPDATE Groups SET BackgroundPicture = '${bg_picture}' WHERE idGroups = '${group_id}';`
  utils.queryPost(sqlQuery,res);
});
  
  
//--------------------------- Get users that participate of a given group -------------------------//
  router.get('/group/:id?/members',(req,res) =>{
    sqlQuery = 'SELECT UserProfile.* '+
    'FROM Participation ' +
    'JOIN UserProfile on UserProfile.idUserProfile = Participation.UserProfile_idUserProfile '+
    'WHERE Participation.Groups_idGroups=' + req.params.id;      
    utils.querySQL(sqlQuery,res);
  })

//--------------------------- Get admin users from a group -------------------------//
router.get('/group/:id?/admins',(req,res) =>{
  const sqlQuery = 'SELECT UserProfile.* '+
  'FROM Participation ' +
  'JOIN UserProfile on UserProfile.idUserProfile = Participation.UserProfile_idUserProfile '+
  'WHERE Participation.Groups_idGroups=' + req.params.id + ` AND Participation.IsAdmin = '1'`;      
  utils.querySQL(sqlQuery,res);
})

//-------------------------- Add admin to group -------------------------------------//
router.get('/group/:id?/admin/add/:user_id?',(req,res)=>{
  const user_id = req.params.user_id;
  const group_id = req.params.id;
  const sqlQuery = `UPDATE Participation SET IsAdmin = '1' WHERE Groups_idGroups = '${group_id}' AND UserProfile_idUserProfile = '${user_id}';`;

  utils.queryPost(sqlQuery,res);
})

//-------------------------- Remove admin of group -------------------------------------//
router.get('/group/:id?/admin/remove/:user_id?',(req,res)=>{
  const user_id = req.params.user_id;
  const group_id = req.params.id;
  const sqlQuery = `UPDATE Participation SET IsAdmin = '0' WHERE Groups_idGroups = '${group_id}' AND UserProfile_idUserProfile = '${user_id}';`;

  utils.queryPost(sqlQuery,res);
})

//-------------------------- Send request to partipacte in group -------------------------------------//
router.post('/group/:id?/request',(req,res)=>{
  const user_requester_id = req.body.user_requester_id;
  const group_id = req.params.id;
  const sqlQuery = `INSERT INTO RequestsGroupParticipation (UserProfile_idUserProfile, Groups_idGroups, DateRequest) ` +
  `VALUES ('${user_requester_id}','${group_id}','${moment(Date.now()).format('YYYY-MM-DD HH:mm:ss')}')`;
  utils.queryPost(sqlQuery,res);
});

//-------------------------- Cancel request to partipacte in group -------------------------------------//
router.post('/group/:id?/request/cancel',(req,res)=>{
  const user_requester_id = req.body.user_requester_id;
  const group_id = req.params.id;
  const sqlQuery = `DELETE FROM RequestsGroupParticipation WHERE UserProfile_idUserProfile = '${user_requester_id}' AND Groups_idGroups = '${group_id}';`;
  utils.queryPost(sqlQuery,res);
})

//------------------------------- List pending request to participate in group ------------------ //
  //------------------------ Get admins users from a group or all of the groups -----------------//
//to do


  module.exports = router;