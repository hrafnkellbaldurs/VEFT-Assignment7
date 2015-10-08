var express = require('express');
var app = express();
app.use(express.bodyParser());

var companiesRoute = '/api/companies';
var usersRoute = '/api/users';

var cIdCounter = 4;
var uIdCounter = 4;

var companies = [ 
{id: 0, name: 'Krónan', punchCount: 20},
{id: 1, name: 'Bónus', punchCount: 30},
{id: 2, name: 'Te og Kaffi', punchCount: 9},
{id: 3, name: 'AllAround', punchCount: 5}
];

var users = [ 
{id: 0, name: 'Gunnar', email: 'gunnar@email.com'},
{id: 1, name: 'Kalli', email: 'kalli@email.com'},
{id: 2, name: 'Hrabbi', email: 'hrabbi@email.com'},
{id: 3, name: 'Rannveig', email: 'rannveig@email.com'}
];

var punches = [
{userId: 0, companyId: 0, date: "hehe"},
{userId: 0, companyId: 0, date: "heho"},
{userId: 0, companyId: 0, date: "lele"},
{userId: 0, companyId: 1, date: "hehe"},
{userId: 0, companyId: 2, date: "hehe"},
{userId: 0, companyId: 3, date: "hehe"},
];

var addCompany = ((_name, _punchCount) => {
	var newCompany = {
		id: cIdCounter,
		name: _name,
		punchCount: _punchCount 
	};

	companies.push(newCompany);
	cIdCounter++;
	return newCompany.id;
});

var addUser = ((_name, _email) => {
	var newUser = {
		id: uIdCounter,
		name: _name,
		email: _email 
	};

	users.push(newUser);
	uIdCounter++;
	return newUser.id;
});

var addPunch = ((_userId, _companyId) =>{
	var newPunch = {
		userId: _userId,
		companyId: _companyId,
		date: new Date().toISOString() 
	};

	punches.push(newPunch);
	return newPunch;
});

var getObjectById = ((arr, id) => {
	console.log('\ngetObjectById: id: ' + id);

	for (var i = 0; i < arr.length; i++) {
		console.log("name: " + arr[i].name);
		if(arr[i].id == id) return arr[i];
	}
	
	return null;
});

var newPunchDTO = ((punch) => {
	var userName = getObjectById(users, punch.userId).name;
	var companyName = getObjectById(companies, punch.companyId).name;
	var punchDTO = {
			userId: punch.userId,
			name: userName,
			companyId: punch.companyId,
			company: companyName,
			date: punch.date
	};

	return punchDTO;
}); 

// COMPANIES

/* Returns a list of all registered companies 
	in json format */
app.get(companiesRoute, (req, res) => {
	res.json(companies);
});

/* Returns a given company by id in json format */
app.get(companiesRoute + '/:id', (req, res) => {
	var company = getObjectById(companies, req.params.id);
	if(company === null){
		res.statusCode = 404;
		return res.send('Error 404: Company not found.');
	}
	res.json(company);
});

/* Adds a new company.
	Param: "name" = The name of the company
	Param: "punchCount" = Indicates how many punches a user needs
							to collect in order to get a discount */
app.post(companiesRoute, (req, res) => {
	if(!req.body.hasOwnProperty('name') ||
		!req.body.hasOwnProperty('punchCount')){
		res.statusCode = 400;
		return res.send('Error 400: Post syntax incorrect.');
	}

	var id = addCompany(req.body.name, req.body.punchCount);
	var companyDTO = getObjectById(companies, id);

	if(companyDTO === null){
		res.statusCode = 500;
		return res.send('Error 500: Company id\'s not in sync');
	}

	res.statusCode = 201;
	res.json(companyDTO);
});


// USERS
app.get(usersRoute, (req, res) => {
	res.json(users);
});

app.get(usersRoute + '/:id/punches', (req, res) => {
	var companyId = req.query.company;
	var userId = req.params.id;
	var userPunchesDTOS = [];

	if(companyId != undefined){
		for (var i = 0; i < punches.length; i++) {
			if(punches[i].userId == userId &&
				punches[i].companyId == companyId){
				var punchDTO = newPunchDTO(punches[i]);
				userPunchesDTOS.push(punchDTO);
			}
		}
		return res.json(userPunchesDTOS);
	}

	for (var i = 0; i < punches.length; i++) {
		if(punches[i].userId == userId){
			var punchDTO = newPunchDTO(punches[i]);
			userPunchesDTOS.push(punchDTO);
		}
	}

	res.json(userPunchesDTOS);

});

app.post(usersRoute, (req, res) => {
	if(!req.body.hasOwnProperty('name') ||
		!req.body.hasOwnProperty('email')){
		res.statusCode = 400;
		return res.send('Error 400: Post syntax incorrect.');
	}

	var name = req.body.name;
	var email = req.body.email;

	if(name === null){
		res.statusCode = 400;
		return res.send('Error 400: Name cannot be null');
	}

	if(email === null){
		res.statusCode = 400;
		return res.send('Error 400: Email cannot be null');
	}

	var id = addUser(name, email);
	var userDTO = getObjectById(users, id);

	if(userDTO === null){
		res.statusCode = 500;
		return res.send('Error 500: User id\'s not in sync');
	}

	res.statusCode = 201;
	res.json(userDTO);
});

app.post(usersRoute + '/:id/punches', (req, res) => {
	if(!req.body.hasOwnProperty('id')){
		res.statusCode = 400;
		return res.send('Error 400: Post syntax incorrect.');
	}

	var companyId = req.body.id;
	var userId = req.params.id;

	if(companyId === null){
		res.statusCode = 400;
		return res.send('Error 400: Company ID cannot be null');
	}

	if(userId === null){
		res.statusCode = 400;
		return res.send('Error 400: User ID cannot be null');
	}

	var punch = addPunch(userId, companyId);
	
	if(punch === null){
		res.statusCode = 500;
		return res.send('Error 500: Punches not in sync');
	}

	var punchDTO = newPunchDTO(punch);

	res.statusCode = 201;
	res.json(punchDTO);
});

app.listen(process.env.PORT || 1000);