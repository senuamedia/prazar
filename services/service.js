var config = require('../config.json');
var mysql = require("mysql");
var Q = require('q');

var pool = mysql.createPool({
  host     : config.db_host,
  user     : config.db_username,
  password : config.db_password,
  database: config.db_name
});

var service = {};
service.runQuery = runQuery;
service.runQueryCallback = runQueryCallback;
service.runQueryCallback2variable = runQueryCallback2variable;

module.exports = service;

function runQuery(sqlquery) {
    var deferred = Q.defer();
    pool.getConnection(function(err, connection) {
    	if(err) { console.log(err);
          connection.release(); 
      		deferred.reject(err);
    	}else{
	     	connection.query(sqlquery, [], function(err, results) {
		 	
	      	connection.release(); 
				
		      	if(err) { 
	        		deferred.reject(err); 
	      		}
				deferred.resolve(results);
	    	});
     	}
  	});

    return deferred.promise;
}

function runQueryCallback(sqlquery,index,callback) {

    pool.getConnection(function(err, connection) {
      if(err) { console.log(err);
        connection.release(); 
         callback(true);
      }else{
        connection.query(sqlquery, [], function(err, results) {
          
          connection.release(); 
            if(err) { console.log(err);
             
              callback(true);
            }
            callback(false,index,results);
        });
      }
    });
}

function runQueryCallback2variable(sqlquery,index,parent_index,callback) {

    pool.getConnection(function(err, connection) {
      if(err) { console.log(err);
        connection.release(); 
         callback(true);
      }else{
        connection.query(sqlquery, [], function(err, results) {
          
          connection.release(); 
            if(err) { console.log(err);
             
              callback(true);
            }
            callback(false,index,parent_index,results);
        });
      }
    });
}