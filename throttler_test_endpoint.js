// simple app that responds to throttler's calls

var express = require('express');
var app = express();

app.set('port', (process.env.PORT || 9001));

app.get('/campaigns', function(req, resp) {    
  
  console.log("Got a request to port "+app.get('port')+", responding");
  //console.log(req);
  resp.send("Hello throttler!")
});

app.listen(app.get('port'), function() {
  console.log("Node app 'test_endpoint' is running at localhost:" + app.get('port'))
})
