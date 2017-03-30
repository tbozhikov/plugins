/**********************************************************************************
 * (c) 2016-2017, Master Technology
 *
 * Any questions please feel free to email me or put a issue up on the github repo
 * Version 0.0.5                                      Nathan@master-technology.com
 *********************************************************************************/
"use strict";

const restify = require('restify');
const config = require('./config').server;
const fs = require('fs');
const child = require('child_process');

const DBSettingKey = process.env.DBSETTINGKEY || "";

let database;
if (config.api) {
	if (config.database === "postgres") {
		database = require('./pgsql');
	} else {
		database = require('./json');
		startProcessingHandler();

		// On database changes, reload the database...
		database.watch(function() {
			console.log("Loading Database");
			database.loadDatabase(() => {
				console.log("Loaded");
				database._getDBSizes();
				authorsData = null;
				categoriesData = null;
			});
		});
	}
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

	server.get({path: '/api/setValue/:key/:table/:id/:field/:value'}, DBSetValue);
	server.get({path: '/api/getValue/:key/:table/:id/:field'}, DBGetValue);
	server.get({path: '/api/getRow/:key/:table/:id'}, DBGetRow);
	server.get({path: '/api/process/:key'}, StartProcessing);
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


function toProperCase(val) {
	return val.toLowerCase().replace(/^(.)|\s(.)/g, function(v) { return v.toUpperCase(); });
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
		delete curData.meta;
		delete curData.$loki;
		if (!curData.shortName) {
			curData.shortName = toProperCase(curData.name.replace('nativescript-', '').replace(/\-/g, ' '));
		}
		curData.author =  {id: curData.author, name: authorsData[curData.author]};
		curData.category = {id: curData.category, name: categoriesData[curData.category]};
		curData.os_support = {android: ((curData.os_support & 1) === 1), ios: ((curData.os_support & 2) === 2) };
		if (curData.npm_download_info) { delete curData.npm_download_info; }

		if (curData.contributors) {
			let cons = [], maintainers = [];
			for (let j=0;j<curData.contributors.length;j++) {
				let author = {id: curData.contributors[j].authorid, author: authorsData[curData.contributors[j].authorid]};
				if (curData.contributors[j].type === 'C') {
					cons.push(author);
				} else {
					maintainers.push(author);
				}
			}
			curData.contributors = cons;
			curData.maintainers = maintainers;
		}


		newData.push(curData);
	}

	callback(newData);
}

function stripLokiResults(results) {
	for (let i=0;i<results.length;i++) {
		delete(results[i].meta);
		delete(results[i].$loki);
	}
}

function categories(req, res, next) {
    database.getCategories(function(err, results) {
        if (err) {
            handleError(res, err.toString());
        } else {
			stripLokiResults(results.rows);
            res.send(results.rows);
        }
        next();
    });
}

function authors(req, res, next) {
    database.getAuthors(function(err, results) {
        if (err) {
            console.error(err);
            handleError(res, err.toString());
        } else {
			stripLokiResults(results.rows);
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
    if (req.params.key == null || req.params.key.length === 0  ) {
        handleError(res, "Plugins requires a type & value");
        next();
        return;
    }

    if (req.params.value == null || req.params.value.length === 0) {
		if (req.params.key.length === 36) {
			req.params.value = req.params.key;
			req.params.key = "category";

		} else {
			handleError(res, "Plugins requires a type & value");
			next();
			return;
		}
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

function DBGetRow(req, res, next) {
	if (req.params.key == null || req.params.key.length === 0 || req.params.key !== DBSettingKey) {
		handleError(res, "API requires a id");
		next();
		return;
	}

	database.getRow(req.params.table, req.params.id, function(err, results) {
		res.send(results);
		next();
	});
}


function DBGetValue(req, res, next) {
	if (req.params.key == null || req.params.key.length === 0 || req.params.key !== DBSettingKey) {
		handleError(res, "API requires a id");
		next();
		return;
	}

	database.getValue(req.params.table, req.params.id, req.params.field, function(err, results) {
		res.send({result: results});
		next();
	});
}

function DBSetValue(req, res, next) {
	if (req.params.key == null || req.params.key.length === 0 || req.params.key !== DBSettingKey) {
		handleError(res, "API requires a id");
		next();
		return;
	}

	database.setValue(req.params.table, req.params.id, req.params.field, req.params.value);
	res.send({changed: "maybe"});
	next();

}

function StartProcessing() {
	if (req.params.key == null || req.params.key.length === 0 || req.params.key !== DBSettingKey) {
		handleError(res, "API requires a id");
		next();
		return;
	}
	startProcessingHandler(true);
	res.send({started: "true"});
	next();
}


/**
 * Starts the processor, every 24 hours at 3am.
 */
function startProcessingHandler(noTimer) {
	let processor = child.spawn("node", ["processor.js"], {});
	processor.stdout.on('data', (data) => {
		console.log(`Processor: ${data}`);
	});

	processor.stderr.on('data', (data) => {
		console.error(`Processor: ${data}`);
	});

	processor.on('close', (code) => {
		console.log(`Processor exited: ${code}`);
		if (code === 255 || code === -1) {
			// Start Processing again in 5 minutes.
			console.log("Processor Exited with failed to download, restarting download in 5 minutes.")
			setTimeout(() => {startProcessingHandler(true); }, 5*60*1000);
		}
	});

	if (noTimer === true) {
		return;
	}
	// Figure out the next timestamp to run the next processing run
	let tomorrow = new Date();
	tomorrow.setMinutes(60);
	tomorrow.setSeconds(0);
	if (tomorrow.getHours() > 3) {
		// Next Day
		tomorrow.setHours(24);
		tomorrow.setHours(3);
	} else {
		// Today
		tomorrow.setHours(3);
	}
	let nextTimeStamp = (tomorrow.getTime()-Date.now());
	console.log("Setting next Processing Run for", nextTimeStamp/1000);

	setTimeout(startProcessingHandler, nextTimeStamp);
}