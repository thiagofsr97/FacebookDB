var connection = require('./connection');

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

function queryTransaction(queries,res){
  connection.beginTransaction(function(err) {
    if (err) { throw err; }
    partialQuery(queries,0,res);

  });
}

function partialQuery(queries,index,res){
  console.log('Size ' + queries.length);
  if(index < queries.length){
    console.log('Index' + index);
    connection.query(queries[index],function(err, result) {
      if (err) { 
        connection.rollback(function() {
        res.json(jsonBuilder(err));
        throw err;
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
              throw err;
          });
      }
      res.json(jsonBuilder(err));
      console.log('Transaction Complete.');
    });
  }
}


module.exports={
    querySQL,
    jsonBuilder,
    queryTransaction
};