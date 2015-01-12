
// INITIALIZATIONS

var express = require('express');
var app = express();
var q = require('q');
var request = require('request');
var fs = require('fs');
var mysql = require('mysql');

var pool = mysql.createPool({
  connectionLimit : 20, // it's lazy, so limit can be high
  host     : '127.0.0.1',
  user     : 'root',
  password : 'password',
  port     : '3306',
  database : 'mydb'
});

app.set('port', (process.env.PORT || 9000));

// INTERNAL FUNCTIONS

/**
* Saves the aggregate actions from returned rows into the passed adData object.
*/
function addAdActions(rows, adData, callback){

  for(var i = 0; i < rows.length; i++){
	var row = rows[i];  
	var actionObj = { count : row.count, value : row.value };	
	adData.actions[row.action] = actionObj;		  		  
  }
  callback();
}

/**
* Saves the aggregate statistics from returned rows into the passed adData object.
*/
function addAdStatistics(rows, adData, callback){

  for(var i = 0; i < rows.length; i++){
    var row = rows[i];
    adData.impressions += row.impressions;
    adData.clicks += row.clicks;
    adData.spent += row.spent;
  }
  callback();
}

/**
* Gets all the data for a single ad id and the date range.
* Uses addAdStatistics and addAdActions.
*/
function getSingleAdData(id,begin_date,end_date,callback){

  var sql_string = function(tablename, id, begin_date, end_date){
    return "SELECT * FROM "+tablename+
    " WHERE ad_id = "+pool.escape(id)+
	" AND date >= "+pool.escape(begin_date)+
	" AND date <= "+pool.escape(end_date);
  };

  pool.getConnection(function(err, connection) {
    
	if(err)
	  console.log(err);
		
	var adData = {
	  impressions : 0,
	  clicks : 0,
	  spent : 0,
	  actions : {}
    };	
		
	var got_stats = false;
	var got_actions = false;
	
    connection.query(sql_string("ad_statistics",id,begin_date,end_date),
	  function(err, rows) {
	  
	  if(err)
        console.log(err);
      
	  //console.log("ran query :")
      //console.log(sql_string("ad_statistics",id,begin_date,end_date))
	  
	  addAdStatistics(rows,adData,function(){	    
		got_stats = true;
	    
		if(got_stats && got_actions){
		  connection.release();
          callback(adData,id);		  
		}
	  })
    });
	
	connection.query(sql_string("ad_actions",id,begin_date,end_date),
  	  function(err, rows) {
	  
	  if(err)
        console.log(err);
	  
	  //console.log("ran query :")
      //console.log(sql_string("ad_actions",id,begin_date,end_date))
	  
	  addAdActions(rows,adData,function(){
		got_actions = true;
		
		if(got_stats && got_actions){
		  connection.release();
          callback(adData,id);		  
		}			
	  });
	});
  });    
}

/**
* Gets the data for all the ad ids and the date range.
* Uses getSingleAdData.
*/
function getAdData (ids, begin_date, end_date, callback) {
  var outputJSON = {};
  var returncount = 0;
  
  for(var i = 0; i < ids.length; i++){
    var id = ids[i];
	
	if(id && parseInt(Number(id)) == id){
      getSingleAdData(id, begin_date, end_date, function(singleAdData, callbackId){
	    
		outputJSON[''+callbackId] = singleAdData;
		returncount++;
		
		if(returncount === ids.length){
		  callback(outputJSON);
		}		 
		//console.log("getSingleAdData : done");
	  });
	}
    else{
	  console.log("not an int :"+id);
	}      	
  } 
}

// EXTERNAL INTERFACE

/**
* Sends a response containing aggregate data for the given ids and date interval.
* Uses getAdData.
*
* Usage : 
* /api/stats?ad_ids=1,2,3&start_time=2013-09-01&end_time=2013-10-01
*/
app.get('/api/stats', function(req, resp) {
  var ids = req.query["ad_ids"].split(",");
  var begin_date = req.query["start_time"];
  var end_date = req.query["end_time"];
  
  console.log("called with : "+ids +"; "+ begin_date +"; "+end_date+";");  
  
  getAdData(ids, begin_date, end_date, function(outputJSON){
  	  resp.send(outputJSON);
      
	  //console.log(outputJSON)
	  console.log("done")
  });
});

/**
* Responds with "hello world"
*/
app.get('/', function(req, resp) {  
  resp.send("hello world");
  console.log("done");
});

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})
