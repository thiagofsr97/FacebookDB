var express = require('express');
var router = express.Router();
var connection = require('./connection');
const moment = require('moment');
const utils = require('./Utils');

// ----------------------------- Commmenting on a post-----------------------------------//

router.post('/post/:post_id?/comment',(req,res)=>{
    const post_id = req.params.post_id;
    const post_owner = req.body.user_id_poster;
    const user_commenter_id = req.body.user_id_commenter;
    const comment = req.body.text;
    const sqlQuery_1 = `INSERT INTO Comments (NumberOfResponses, Post_idPost, Post_UserProfile_idUserProfile_postOwner, UserProfile_idUserProfile_commenter) VALUES ('0', '${post_id}', '${post_owner}', '${user_commenter_id}');`
    const sqlQuery_2 = 'UPDATE Post '+
            'SET Post.NumberOfComments = Post.NumberOfComments + 1 ' +
            `WHERE (Post.idPost = '${post_id}') AND (Post.UserProfile_idUserProfile_postOwner = '${post_owner}');`
    
    utils.queryTransaction([sqlQuery_1,sqlQuery_2],res);


});


// ----------------------------- Deleting a comment on a post -----------------------------------//

router.get('/post/:post_id?/comments/:comment_id?/delete',(req,res)=>{
    const post_id = req.params.post_id;
    const comment_id = req.params.comment_id;    
    const sqlQuery_1 = `DELETE FROM Comments WHERE idComments = '${comment_id}';`
    const sqlQuery_2 = `UPDATE Post SET NumberOfComments = NumberOfComments - 1 WHERE idPost = '${post_id}';`

    utils.queryTransaction([sqlQuery_1,sqlQuery_2],res);
});

// ----------------------------- Responding a comment on a post-----------------------------------//
router.post('/post/:post_id?/comment/:comment_id/respond',(req,res)=>{
    const post_id = req.params.post_id;
    const comment_id = req.params.comment_id;
    const post_owner = req.body.user_id_poster;
    const user_commenter_id = req.body.user_id_commenter;
    const user_responder_id = req.body.user_id_responder;
    const response = req.body.text;
    const sqlQuery_1 = `INSERT INTO Responses(ResponseTime, Comments_idComments, Comments_Post_idPost, Comments_Post_UserProfile_idUserProfile_postOwner, Comments_UserProfile_idUserProfile_commenter, UserProfile_idUserProfile_responder, text) ` +
    `VALUES ('${moment(Date.now()).format('YYYY-MM-DD HH:mm:ss')}','${comment_id}','${post_id}','${post_owner}','${post_owner}','${user_commenter_id}','${user_id_responder}','${response}')`;
    const sqlQuery_2 = `UPDATE Comments SET NumberOfResponses = NumberOfResponses + 1 WHERE idComments = '${comment_id}';`

    utils.queryTransaction([sqlQuery_1,sqlQuery_2],res);
});

// ----------------------------- Deleting a comment on a post -----------------------------------//

router.get('/comments/:comment_id?/responses/:response_id?/delete',(req,res)=>{
    const response_id = req.params.response_id;
    const comment_id = req.params.comment_id;    
    const sqlQuery_1 = `DELETE FROM Responses WHERE idResponses = '${response_id}';`
    const sqlQuery_2 = `UPDATE Comments SET NumberOfResponses = NumberOfResponses - 1 WHERE idComments = '${comment_id}';`

    utils.queryTransaction([sqlQuery_1,sqlQuery_2],res);


});
module.exports = router;