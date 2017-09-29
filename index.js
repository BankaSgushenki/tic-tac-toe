'use strict';

Array.prototype.getValue = function(x, y) {
	return this[y * SIZE + x];
}

Array.prototype.setValue = function(x, y, value) {
	return this[y * SIZE + x].value = value;
}

let express = require('express');
let app = express();
let expressWs = require('express-ws')(app);

let CLIENTS = [];

let mutex = false;

let Cell = function() {
	this.value = null;
}

let SIZE = 16;

let field = [];

for (let i = 0; i < SIZE * SIZE; i++) {
	field.push(new Cell());
}

app.get('/field', function (req, res) {
	res.send(field)
})
 
app.ws('/', function(ws, req) {
	CLIENTS.push(ws);
  	ws.on('message', function(msg) {
    	if (msg === "field") {
    		console.log("sending field");
    		console.log("***************");
    		ws.send(JSON.stringify({type: "INIT", field: field, clientId: CLIENTS.indexOf(ws) === 0 ? "x" : "o"}));
    	}

    	else {
    		let user = CLIENTS.indexOf(ws);
    		
    		if(mutex === !!user) {

    			let nextUser = user ? 0 : 1;
    			let parsedMsg = JSON.parse(msg);
    			let index = parseInt(parsedMsg.y)*SIZE + parseInt(parsedMsg.x);
		
    			if (setValue(index, parsedMsg.value)) {
    				console.log("setting cell", parsedMsg);
    				console.log("***************");
    				sendAll(JSON.stringify({type: "FIELD", field: field}));

    				checkField();
	
    				CLIENTS[nextUser].send(JSON.stringify({type: "NEXT_MOVE"}));
    				mutex = !mutex;
    			}
    		}
    	}
  	});
});
 
app.listen(3001);

function setValue(index, value) {
	if (!field[index].value) {
		field[index].value = value;
		return true;
	}

	return false;
}

function sendAll(message) {
    for (let i=0; i<CLIENTS.length; i++) {
        CLIENTS[i].send(message);
    }
}

function checkField() {
	for (let y = 0; y < SIZE; y++) {
		for (let x = 0; x < SIZE; x++) {
			console.log(field.getValue(x, y));
		}
	}
}