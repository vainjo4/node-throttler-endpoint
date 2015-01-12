// simple app for testing the throttler library

var throttler = require("throttler")
var express = require('express');
var app = express();

throttler.endpoint = "http://localhost:9001"
throttler.token = "abcdef"

app.set('port', (process.env.PORT || 9000));

app.get('/test/get/campaigns', function(req, resp) {       
  throttler.get("/campaigns")
	.then(function(value){resp.send("test client : got a promise back!")}); 
});

app.listen(app.get('port'), function() {
  console.log("Node app 'throttler_test_client' is running at localhost:" + app.get('port'))
})
