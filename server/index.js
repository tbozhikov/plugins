/**********************************************************************************
 * (c) 2016-2017, Master Technology
 *
 * Any questions please feel free to email me or put a issue up on the github repo
 * Version 0.0.3                                      Nathan@master-technology.com
 *********************************************************************************/
"use strict";

const restify = require('restify');
const config = require('./config').server;
const fs = require('fs');

let database;
if (config.api) {
	database = require('./pgsql');
}

// Setup the server options
const server = restify.createServer();
server.use(restify.gzipResponse());
server.use(restify.queryParser());
server.use(restify.authorizationParser());
server.use(restify.CORS());

// Configure API end points if needed
if (config.api) {
	server.get({path: '/api/getCategories', version: '1.0.0'}, categories);
	server.get({path: '/api/getAuthors', version: '1.0.0'}, authors);
	server.get({path: '/api/search', version: '1.0.0'}, search);
	server.get({path: '/api/search/:value', version: '1.0.0'}, search);
	server.get({path: '/api/getPlugins', version: '1.0.0'}, pluginsAll);
	server.get({path: '/api/getPlugins/all', version: '1.0.0'}, pluginsAll);
	server.get({path: '/api/getPlugins/:key', version: '1.0.0'}, pluginsKeyValue);
	server.get({path: '/api/getPlugins/:key/:value', version: '1.0.0'}, pluginsKeyValue);
	server.get({path: '/api/getPlugin/:key', version: '1.0.0'}, pluginById);
	server.get({path: '/api/getPluginCount', version: '1.0.0'}, pluginCount);
} else if (config.forward) {
	server.get({path: /\/api\/?.*/, version: '1.0.0'}, followRedirects);
}

const http = require('http');
function followRedirects(req, res, next) {
	http.get({host: "nativescript.rocks", port: 3004, path: req.url}, function(response) {
		let body = '';
		response.on('data', (d) => {
			body += d;
		});
		response.on('end', () => {
			let data = {error: true};
			try {
				data = JSON.parse(body);
			} catch (err) {
				data = {error: "please try again" };
			}
			res.send(data);
			next();
		});
	});
}



// Setup which type of Static server we are going to be.
let serveData = null;
if (config.static) {
	serveData = restify.serveStatic({
		directory: './dist/',
		default: 'index.html'
	});

} else {
	serveData = function(req, res, next) {
		res.redirect(config.redirect, next);
	};
}
server.get('/', serveData );
server.get('/index.html', serveData);
server.get(/\/dist\/?.*/, serveData);
server.get(/^(?!\/api\/).*/, serveData);
server.on('ResourceNotFound', errorRedirect);

let cachedIndex = null;
function errorRedirect(req, res, error, next) {
	if (cachedIndex) {
		res.setHeader('Content-Type', 'text/html');
		res.writeHead(200);
		res.end(cachedIndex);
		next();
	} else {
		fs.readFile('./dist/index.html', function (err, data) {
			if (err) {
				res.send("Error occurred, please try again.");
				next();
				return;
			}
			cachedIndex = data;

			res.setHeader('Content-Type', 'text/html');
			res.writeHead(200);
			res.end(data);
			next();
		});
	}
}

// Activate the Server for taking requests
server.listen(config.port, function() {
	console.log('%s listening at %s', server.name, server.url);
});


// --------------------------------------------------------------------------------
// Support functions
// --------------------------------------------------------------------------------
let authorsData = null, categoriesData=null;

// Clear Data of these every 12 hours;
setTimeout(function() {
	authorsData = null; categoriesData = null;
}, 60000 * 12);

function toProperCase(val) {
	return val.toLowerCase().replace(/^(.)|\s(.)/g, function(v) { return v.toUpperCase(); });
}

function pluginData(req, res, next) {
	res.send("Hey we are looking at a plugin");
	next();
}

function fixGroupData(data) {
	let dataSet = {};
	const count = data.length;
	for (let i=0;i<count;i++) {
		dataSet[data[i].id] = data[i].name;
	}
	return dataSet;
}

function fixData(data, callback) {
	let newData = [];
	if (authorsData === null) {
		database.getAuthors(function (err, results) {
			authorsData = fixGroupData(results.rows);
			fixData(data, callback);
		});
		return;
	}
	if (categoriesData === null) {
		database.getCategories(function(err, results) {
			categoriesData = fixGroupData(results.rows);
			fixData(data, callback)
		});
		return;
	}

	const count = data.length;

	for (let i=0;i<count;i++) {
		let curData = data[i];
		if (!curData.shortName) {
			curData.shortName = toProperCase(curData.name.replace('nativescript-', '').replace(/\-/g, ' '));
		}
		curData.author =  {id: curData.author, name: authorsData[curData.author]};
		curData.category = {id: curData.category, name: categoriesData[curData.category]};
		curData.os_support = {android: ((curData.os_support & 1) === 1), ios: ((curData.os_support & 2) === 2) };
		newData.push(curData);
	}

	callback(newData);
}

function categories(req, res, next) {
	database.getCategories(function(err, results) {
		if (err) {
			handleError(res, err.toString());
		} else {
			res.send(results.rows);
		}
		next();
	});
}

function authors(req, res, next) {
	database.getAuthors(function(err, results) {
		if (err) {
			console.log(err);
			handleError(res, err.toString());
		} else {
			res.send(results.rows);
		}
		next();
	});
}

function search(req, res, next) {
	if (req.params.value == null || req.params.value.length === 0) {
		handleError(res, "Search requires a parameter");
		next();
		return;
	}
	const options = getOptions(req.params);
	database.search(req.params.value, options, function (err, results) {
		if (err) {
			handleError(res,  err.toString() );
			next();
		} else {
			fixData(results.rows, function(data) {
				res.send(data);
				next();
			});
		}
	})
}

const validSortFields = ['name', 'author', 'category', 'description', 'os_support', 'user_score', 'version', 'language', 'marketplace_score', 'modified_date'];
function getOptions(params) {

	let options = {sort: 'name', direction: 'asc', offset: 0, limit: 0};
	if (params.sort) {
		if (validSortFields.indexOf(params.sort) >= 0) { options.sort = params.sort; }
	}
	if (params.order) {
		if (params.order === 'asc' || params.order === 'desc') {
			options.direction = params.order
		}
	}
	if (params.offset) {
		const newOffset = parseInt(params.offset, 10);
		if (newOffset > 0) {
			options.offset = newOffset;
		}
	}
	if (params.limit) {
		const newLimit = parseInt(params.limit, 10);
		if (newLimit > 0) {
			options.limit = newLimit;
		}
	}
	return options;
}

function pluginsAll(req, res, next) {
	const options = getOptions(req.params);

	database.getAllPlugins(options, function (err, results) {
		if (err) {
			handleError(res,  err.toString() );
			next();
		} else {
			fixData(results.rows, function(data) {
				res.send(data);
				next();
			});
		}
	})
}

function pluginsKeyValue(req, res, next) {
	if (req.params.key == null || req.params.value == null || req.params.key.length === 0 || req.params.value.length === 0 ) {
		handleError(res, "Plugins requires a type & value");
		next();
		return;
	}

	const options = getOptions(req.params);

	let func;
	switch(req.params.key) {
		case 'author': func = 'getPluginsOfAuthor'; break;
		case 'category': func = 'getPluginsInCategory'; break;
	}

	if (!func) {
		handleError(res, "Plugins requires a valid type");
		next();
		return;
	}

	database[func](req.params.value, options, function (err, results) {
		if (err) {
			handleError(res,  err.toString() );
			next();
		} else {
			fixData(results.rows, function(data) {
				res.send(data);
				next();
			});
		}

	});
}

function pluginById(req, res, next) {
	if (req.params.key == null || req.params.key.length === 0 ) {
		handleError(res, "Plugins requires a id");
		next();
		return;
	}

	database.getPluginById(req.params.key, function (err, results) {
		if (err) {
			handleError(res,  err.toString() );
		} else {
			fixData(results.rows, function(data) {
				res.send(data);
				next();
			});
		}
		next();
	});
}

function pluginCount(req, res, next) {
	database.getPluginCount(function (err, results) {
		if (err) {
			handleError(res,  err.toString() );
		} else {
			res.send(results.rows[0]);
		}
		next();
	});
}

function handleError(res, error) {
	console.error(error);
	res.send("{error: '" +error + "'}");
}

