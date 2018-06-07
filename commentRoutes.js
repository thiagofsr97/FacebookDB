var connection = require('./connection');

// ----------------------------- Commmenting on a post -----------------------------------//

router.post('/user/:id_user?/posts/:id_post?/comment',(req,res)=>{
    const user_id = req.params.id_user;
    const post_id = req.params.id_post;
    const user_commenter_id = req.body.user_id;
    const comment = req.body.text;
    const sqlQuery_1 = `INSERT INTO Comments (NumberOfResponses, Post_idPost, Post_UserProfile_idUserProfile_postOwner, UserProfile_idUserProfile_commenter) VALUES ('0', '${post_id}', '${user_id}', '${user_commenter_id}');`
    const sqlQuery_2 = 'UPDATE Post '+
            'SET Post.NumberOfComments = Post.NumberOfComments + 1 ' +
            `WHERE (Post.idPost = ${post_id}) && (Post.UserProfile_idUserProfile_postOwner = '${user_id}');`
    
    utils.queryTransaction([sqlQuery_1,sqlQuery_2],res);


});