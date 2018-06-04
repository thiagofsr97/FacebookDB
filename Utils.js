var connection = require('../nodemysql/connection');

function querySQL(sqlQuery,res){
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

function jsonBuilder(err){
    if(err){
        return {sucess:false,message:'error in database',error:err};
    }
    return {sucess:true,message:'query executed.'};
}


module.exports={
    querySQL,
    jsonBuilder

};