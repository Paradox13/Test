// Port where we'll run the websocket server
var webSocketsServerPort = process.env.PORT || 5000;
 
// websocket and http servers
var webSocketServer = require('websocket').server;
var http = require('http');
var url = require("url");
qs = require('querystring');

// list of currently connected clients (users)
var clients = [ ];

var server = http.createServer(function(request, response) {
    
	if (request.method === 'POST') {
    var body = '';
    request.on('data', function(chunk) {
      body += chunk;
    });
    request.on('end', function() {
      var data = qs.parse(body);
      console.log(data);
	  // now you can access `data.email` and `data.password`
      response.writeHead(200);
      response.end(JSON.stringify(data));
    });
	} else {
		response.writeHead(404);
		response.end();
	}
	
	var pathname = url.parse(request.url).pathname;
	console.log("Request for " + pathname + " received.");
	if (pathname == '/notify' && request.method == 'POST'){
		//response.writeHead(200, {"Content-Type": "text/plain"});
		var query = url.parse(request.url, true).query;
		if (query['room']!=null){
			console.log('notify for room: ' +  query['room']);
			var count = 0;
			
			if (body != null){
				var data = qs.parse(body);
				for (var i=0; i < clients.length; i++) {
					if (clients[i].room == query['room']){
						count++;
						clients[i].sendUTF(data);
					}
				}	
				//response.write("Sent to " + count + " clients in room " + query['room']);
				console.log("Sent to " + count + " clients in room " + query['room']);
				console.log("Data: " + body);
			}
		}
		else{
			response.write("Room not specified");
			console.log("trying to send data without room");
		}
		response.end();
	}
	else{
		response.writeHead(403);
		response.end();
	}
});
server.listen(webSocketsServerPort, function() {
    console.log((new Date()) + " Server is listening on port " + webSocketsServerPort);
});

/**
 * WebSocket server
 */
var wsServer = new webSocketServer({
    // WebSocket server is tied to a HTTP server. WebSocket request is just
    // an enhanced HTTP request. For more info http://tools.ietf.org/html/rfc6455#page-6
    httpServer: server
});

function originIsAllowed(origin) {
  // put logic here to detect whether the specified origin is allowed.
  return true;
}

// This callback function is called every time someone
// tries to connect to the WebSocket server
wsServer.on('request', function(request) {
    console.log((new Date()) + ' Connection from origin ' + request.origin + '.');
 
    // accept connection - you should check 'request.origin' to make sure that
    // client is connecting from your website
    // (http://en.wikipedia.org/wiki/Same_origin_policy)
    var connection = request.accept(null, request.origin); 
    // we need to know client index to remove them on 'close' event
    var index = clients.push(connection) - 1;
    console.log(request.origin);
	console.log((new Date()) + ' Connection accepted.');
    // user sent some message
    var query = url.parse(request.httpRequest.url, true).query;
	console.log('room:' + query['room']);
	connection.room = query['room'];
	connection.on('message', function(message) {
        if (message.type === 'utf8') { // accept only text
			console.log((new Date()) + ' Received Message: ' + message.utf8Data);
        }
    });
 
    // user disconnected
    connection.on('close', function(connection) {
		console.log((new Date()) + " Peer " + connection.remoteAddress + " disconnected.");
		// remove user from the list of connected clients
		clients.splice(index, 1);
    });
 
});