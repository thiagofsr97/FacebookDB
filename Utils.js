var connection = require('./connection');
function queryPost(sqlQuery,res){
  connection.query(sqlQuery,function(error,results,fields){
      res.json(jsonBuilder(error));    
      console.log('Query executed...');
  });
}
function querySQL(sqlQuery,res){
    connection.query(sqlQuery,function(error,results,fields){
      if(error){
        res.json(jsonBuilder(error));
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

function queryTransaction(queries,res){
  connection.beginTransaction(function(err) {
    if (err) { res.json(jsonBuilder(err)); }
    else{
      partialQuery(queries,0,res);
    }

  });
}

function partialQuery(queries,index,res){
  if(index < queries.length){
    connection.query(queries[index],function(err, result) {
      if (err) { 
        connection.rollback(function() {
        res.json(jsonBuilder(err));
        });
      }
      index = index + 1;
      partialQuery(queries,index,res);
    });
  }else{
    connection.commit(function(err){
      if(err){
          connection.rollback(function(){
              res.json(jsonBuilder(err));
          });
      }
      res.json(jsonBuilder(err));
      console.log('Transaction Complete.');
    });
  }
}


module.exports={
    queryPost,
    querySQL,
    jsonBuilder,
    queryTransaction
};