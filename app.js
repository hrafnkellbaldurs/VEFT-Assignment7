var express = require('express');
var app = express();
var companiesRoute = '/api/companies';
var usersRoute = '/api/users';

var companies = [ 
{name: 'Arion Banki', description: 'Bank'},
{name: 'Bónus', description: 'Supermarket'},
{name: 'Eimskip', description: 'Shipping'},
{name: 'AllAround', description: 'Tourist Attractions'}
];

app.get(companiesRoute, (req, res) => {
	res.json(companies);
});

app.get(companiesRoute + '/:id', (req, res) => {
	var id = req.params.id;
	if(companies.length <= id || id < 0) {
		res.statusCode = 404;
		return res.send('Error 404: No company found');
	}
	var q = companies[id];
	res.json(q);
});

app.listen(process.env.PORT || 1000);