var http = require('http'),
    qs = require('querystring');

var server = http.createServer(function(req, res) {
  if (req.method === 'POST') {
    var body = '';
    req.on('data', function(chunk) {
      body += chunk;
    });
    req.on('end', function() {
      var data = qs.parse(body);
      console.log(data);
	  // now you can access `data.email` and `data.password`
      res.writeHead(200);
      res.end(JSON.stringify(data));
    });
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(80);