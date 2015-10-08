var express = require('express');
var app = express();

app.get('/', (req, res) => {
	// Set the Content-Type header
	res.type('text/plain');
	// Sets the Content-Length header and sends a reply
	res.send('I\'m a black berry');
});

app.listen(process.env.PORT || 1000);