/* Setup */
var express = require('express');
var app = express();
app.use(express.bodyParser());

/* Predefined routes for the API */
var companiesRoute = '/api/companies';
var usersRoute = '/api/users';

/* A unique identifier counter for each added company. */
var cIdCounter = 0;

/* A unique identifier counter for each added user*/
var uIdCounter = 0;

/* An array of company objects with the values:
	id: int
	name: string
	punchCount: int */
var companies = [];

/* An array of user objects with the values:
	id: int
	name: string
	email: string */
var users = [];

/* An array of punch objects with the values:
	userId: int 
	companyId: int 
	date: string */
var punches = [];

/* Adds a new company with the given name and punchcount to the companies array.
	Returns the id of the created company. */
function addCompany(_name, _punchCount) {

	var newCompany = {
		id: cIdCounter,
		name: _name,
		punchCount: _punchCount 
	};

	companies.push(newCompany);
	cIdCounter++;
	return newCompany.id;
}

/* Adds a new user with the given name and email to the users array. 
	Returns the id of the created user. */
function addUser(_name, _email) {

	var newUser = {
		id: uIdCounter,
		name: _name,
		email: _email 
	};

	users.push(newUser);
	uIdCounter++;
	return newUser.id;
}

/* Adds a punch with the given userId and companyId to the punches array. 
	Returns the added punch. */
function addPunch(_userId, _companyId) {

	var newPunch = {
		userId: _userId,
		companyId: _companyId,
		date: new Date().toISOString() 
	};

	punches.push(newPunch);
	return newPunch;
}

/* Finds and returns the object with the given id in the given array. 
	If no object is found, returns null. */
function getObjectById(arr, id) {

	for (var i = 0; i < arr.length; i++) {
		if(arr[i].id == id) return arr[i];
	}
	
	return null;
}

/* Returns a PunchDTO */
function newPunchDTO(punch) {

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
}

/* Returns true if the object with the id exists in the given array, else false. */
function objectExists(arr, id){
	for (var i = 0; i < arr.length; i++) {
		if(arr[i].id == id) return true;
	}
	return false;
}

/* COMPANIES */

/* Returns a list of all registered companies in json format. */
app.get(companiesRoute, (req, res) => {
	console.log("got GET request");
	res.json(companies);
});

/* Returns a single company with the given ID in the url. */
app.get(companiesRoute + '/:id', (req, res) => {
	var company = getObjectById(companies, req.params.id);
	if(company === null){
		res.statusCode = 404;
		return res.send('Error 404: Company not found.');
	}
	res.json(company);
});

/* Registers a new company. */
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

/* USERS */

/* Returns a list of all registered users. */
app.get(usersRoute, (req, res) => {
	res.json(users);
});

/* Returns all punches registered for a user with the given ID.
	If the user provides a query with a company ID, the API returns 
	all punches registered for the user with the given company. */
app.get(usersRoute + '/:id/punches', (req, res) => {
	var companyId = req.query.company;
	var userId = req.params.id;
	var userPunchesDTOS = [];

	if(!objectExists(users, userId)){
		res.statusCode = 404;
		return res.send('Error 404: User does not exist.');
	}

	/* If the user has provided a query. */
	if(companyId !== undefined){

		if(!objectExists(companies, companyId)){
			res.statusCode = 404;
			return res.send('Error 404: Company does not exist.');
		}

		for (var i = 0; i < punches.length; i++) {
			if(punches[i].userId == userId &&
				punches[i].companyId == companyId){
				userPunchesDTOS.push(newPunchDTO(punches[i]));
			}
		}
		return res.json(userPunchesDTOS);
	}

	/* If the user has not provided a query*/
	for (var j = 0; j < punches.length; j++) {
		if(punches[j].userId == userId){
			userPunchesDTOS.push(newPunchDTO(punches[j]));
		}
	}

	res.json(userPunchesDTOS);
});

/* Registers a new user. */
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

/* Registers a new punch for the user with the given user ID. */
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