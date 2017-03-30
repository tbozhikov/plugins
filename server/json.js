/**********************************************************************************
 * (c) 2017, Master Technology
 *
 * Any questions please feel free to email me or put a issue up on the github repo
 * Version 0.0.1                                      Nathan@master-technology.com
 *********************************************************************************/
"use strict";

const fs = require('fs');
const lokijs = require('lokijs');
const config = require("./config").lokijs;
const uuid = require('uuid');

const verbose = true;
let db = null, dbChangedByUs = 0;
let dbOpened = false, dbResolver = null;


if (!fs.existsSync("database.db")) {
	if (config.mongoDB) {
		// Now open the existing Database
		retrieveDatabaseFromMongo(openLokiDatabase);
	} else {
		openLokiDatabase();
	}
} else {
	openLokiDatabase();
}

/**
 * Opens the Loki Database
 */
function openLokiDatabase() {
	//const lfs = new lokijs.LokiFsAdapter();
	db = new lokijs('database.db', {autoload: true, autoloadCallback : loadHandler}); //, {adapter: lfs});
}


/**
 * Called when the database is loaded
 */
function loadHandler() {
	const categories = ['Developer', 'New', 'All', 'Interface', 'Processing', 'Templates', 'Themes'];
	dbOpened = true;
	let col1 = db.getCollection("plugins");
	if (col1 === null) {
		console.log("Creating new database");
		// Create our collections
		const settings = db.addCollection("settings", {unique:['id'], clone: true});
		settings.insert({id: 1, last_updated: '0000-00-00'});

		db.addCollection("plugins",  { unique:['id'], indices: ['status','name'], clone: true });
		db.addCollection("authors", { unique:['id'], clone: true });
		const cat = db.addCollection("categories",  { unique:['id'], clone: true });

		// Add the categories
		cat.insert({id: '00000000-0000-0000-0000-000000000000', name: 'hidden'});
		for (let i=0;i<categories.length;i++) {
			cat.insert({id: uuid.v4(), name: categories[i]});
		}

		db.addCollection("plugincontributors",  { indices:['pluginid', 'authorid'], clone: true });
		db.addCollection("pluginmaintainers",  { indices:['pluginid', 'authorid'], clone: true });
	}
	_getDBSizes();

	if (dbResolver !== null) {
		dbResolver();
		dbResolver = null;
	}
}

/**
 * Simple function to get the current record counts
 * @private
 */
function _getDBSizes() {
	let tables = ['plugincontributors', 'pluginmaintainers', 'categories', 'settings', 'plugins', 'authors'];
	for (let i=0;i<tables.length;i++) {
		let x = db.getCollection(tables[i]);
		console.log(" ", tables[i], x.count());
	}
	console.log("", "-------------------------", "\r\n");
}

/**
 * Allows us to wait until the database is ready
 * @returns {Promise}
 */
exports.dataReady = function () {
	return new Promise((resolve) => {
		if (dbOpened) { resolve(); }
		else {
			dbResolver = resolve;
		}
	});
};

/*
Used to get the saved database from Mongo
 */
function retrieveDatabaseFromMongo(callback) {
	const MongoClient = require('mongodb');
	MongoClient.connect(config.mongoDB, function(err, db) {
		if (err) {
			console.error("", err);
			config.mongoDB = false;
			if (callback) { callback(); }
			return;
		}
		const collection = db.collection('documents');
		collection.find({'id': 1}).toArray(function(err, docs) {
			if (err) {
				console.error("Error in Mongo.find", err);
			}

			if (docs && docs.length) {
				if (docs[0].data.length > 10) {
					try {
						fs.writeFileSync("./database.db", docs[0].data);
					} catch (err) {
						// Do nothing.
					}
				}
				db.close();
				if (callback) { callback(); }
			} else {
				collection.insertMany([{id: 1, data: "{}"}], function(err) {
					if (err) {
						console.error("Error in Mongo.Insert", err);
					}
					db.close();
					if (callback) { callback(); }
				});
			}
		});
	});
}

/*
Used to update the database into Monog
 */
function updateMongoDB(callback) {
	const data = fs.readFileSync("./database.db").toString();
	const MongoClient = require('mongodb');
	MongoClient.connect(config.mongoDB, function(err, db) {
		const collection = db.collection('documents');
		collection.updateOne({'id': 1}, {$set: {data: data}}, function(err) {
			if (err) {
				console.error("Error in Mongo.updateOne", data.length, err);
			}
			db.close();
			if (callback) { callback(); }
		});
	});
}


/**
 * Get a single category by id
 * @param id
 * @param callback
 */
/*
exports.getCategory = function (id, callback) {
	let category = db.getCollection('categories');
	const results = category.by('id', id);
	callback(null, {rows: results});
};
*/

/**
 * Get all categories except for hidden one
 * @param callback
 */
exports.getCategories = function (callback) {
	let category = db.getCollection('categories');
	const results = category.find({'id': {'$ne': '00000000-0000-0000-0000-000000000000'}});
	callback(null, {rows: results});
};

/**
 * Get a single author by id
 * @param id
 * @param callback
 */
/*
exports.getAuthor = function (id, callback) {
	let authors = db.getCollection('authors');
	const results = authors.by('id', id);
	callback(null, {rows: results});
};
*/

/**
 * Get all the authors
 * @param callback
 */
exports.getAuthors = function (callback) {
	let authors = db.getCollection('authors');
	const results = authors.find({'id': {'$ne': '00000000-0000-0000-0000-000000000000'}});
	callback(null, {rows: results});
};

/**
 * Sorts, Offset, Limits
 * @param results
 * @param options
 */
function parseOptions(results, options) {
	if (options.sort) {
		const sort = options.sort;
		let sortFunction = function(a,b) {
			if (a[sort] < b[sort]) {
				return -1;
			} else if (a[sort] > b[sort]) {
				return 1;
			}
			return 0;
		};
		if (options.direction && options.direction === 'desc') {
			sortFunction = function(a,b) {
				if (a[sort] < b[sort]) {
					return 1;
				} else if (a[sort] > b[sort]) {
					return -1;
				}
				return 0;
			};
		}
		results.sort(sortFunction);
	}
	if (options.offset > 0) {
		results.splice(0, options.offset);
	}
	if (options.limit > 0) {
		results.splice(options.limit, results.length);
	}

}

/**
 * Clears any fields not needed out of a plugins result set
 * @param results
 * @returns {Array}
 */
function clearFields(results) {
	const fields = ['id', 'author', 'catalog_data', 'category','description', 'keywords', 'marketplace_score', 'modified_date', 'name', 'os_support', 'repo_site', 'repo_url', 'status', 'user_score', 'version' ];
	let newResults=[];
	for (let i=0;i<results.length;i++) {
		let rec = results[i], newRec = {};
		for (let j = 0; j<fields.length;j++) {
			let key = fields[j];
			newRec[key] = rec[key];
		}
		newResults.push(newRec);
	}
	return newResults;
}

/**
 * Search for a plugin by value
 * @param value
 * @param options
 * @param callback
 */
exports.search = function (value, options, callback) {
	let plugins = db.getCollection('plugins');

	let results = plugins.where((rec) => {
		if (rec.status >= 1) {
			if ((rec.name && rec.name.toLowerCase().indexOf(value) >= 0)
				|| (rec.description && rec.description.toLowerCase().indexOf(value) >= 0)
				|| (rec.keywords && rec.keywords.toLowerCase().indexOf(value) >= 0)) {
				return true;
			}
		}
		return false;
	});
	parseOptions(results, options);
	results = clearFields(results);
	callback(null, {rows: results});
};

/**
 * Get the total plugin count
 * @param callback
 */
exports.getPluginCount = function(callback) {
	let plugins = db.getCollection('plugins');
	const results = plugins.find({'status': {'$gte': 1}});
	callback(null, {rows: [{count: results.length}]});
};

/**
 * Get all plugins
 * @param options
 * @param callback
 */
exports.getAllPlugins = function (options, callback) {
	let plugins = db.getCollection('plugins');
	let results = plugins.find({'status': {'$gte': 1}});
	parseOptions(results, options);
	results = clearFields(results);
	callback(null, {rows: results});
};

/**
 * Get all the Contributors and Maintainers for a Plugin by plugin id
 * @param id
 * @param callback
 */
exports.getContributorsAndMaintainers = function(id, callback) {
	let pluginContributors = db.getCollection('plugincontributors');
	let pluginMaintainers = db.getCollection('pluginmaintainers');
	const contrib = pluginContributors.find({'pluginid': {'$eq': id}});
	const maintain = pluginMaintainers.find({'pluginid': {'$eq': id}});

	let results = [];
	for (let i=0;i<contrib.length;i++) {
		contrib[i].type = 'C';
		results.push(contrib[i]);
	}
	for (let i=0;i<maintain.length;i++) {
		maintain[i].type = 'M';
		results.push(maintain[i]);
	}

	callback(null, {rows: results});
};

/**
 * Get a plugin by an id
 * @param id
 * @param callback
 */
exports.getPluginById = function (id, callback) {

	let doneWithPlugin = function(err, data) {
		if (err) { return callback(err); }
		if (!data.rows.length) {
			return callback(err, data);
		}
	   exports.getContributorsAndMaintainers(data.rows[0].id, function(err, data2) {
	   		if (err) { return callback(err); }
	   		data.rows[0].contributors = data2.rows;
	   		callback(null, data);
	   });
	};

	let plugins = db.getCollection('plugins');
	if (id.length !== 36 || id[8] !== '-' || id[13] !== '-' || id[18] !== '-' || id[23] !== '-') {
		let name = id.toLowerCase();
		if (name[0] === '!') {
			name = name.substring(1, name.length);
			let results = plugins.find({'name': {'$eq': name}});
			doneWithPlugin(null, {rows: results});
		} else {
			let results = plugins.find({'$and': [{'status': {'$gte': 1}}, {'name': name}]});
			doneWithPlugin(null, {rows: results});
		}
	} else {
		let results = plugins.by('id', id);
		doneWithPlugin(null, {rows: [results]});
	}
};

/**
 * Get all the plugins by an author
 * @param author
 * @param options
 * @param callback
 */
exports.getPluginsOfAuthor = function (author, options, callback) {
	// Get list of plugins that this author is linked too
	let authors = db.getCollection('pluginmaintainers');
	let authResults = authors.find({'authorid': author});

	let counter=0, total=authResults.length+1, results=[], resultKeys=[];

	const doneWithPlugin = function(err, data) {
		counter++;

		if (data && data.rows && data.rows.length) {
			for (let i=0;i<data.rows.length;i++) {
				if (resultKeys.indexOf(data.rows[i].id) >= 0) { continue; }
				resultKeys.push(data.rows[i].id);
				results.push(data.rows[i]);
			}
		}

		// We don't do anything tell we have completed getting ALL our results back
		if (counter < total) { return; }

		// We need to filter them down by valid plugins
		let newResults = [];
		for (let i=0;i<results.length;i++) {
			if (results[i].status >= 1) { newResults.push(results[i]); }
		}

		// Sort, Limit results
		parseOptions(newResults, options);

		// Eliminate files we don't need from the result set
		results = clearFields(newResults);

		callback(null, {rows: results});
	};

	// Look up each of the plugins returned from the maintainers list
	for (let i=0;i<authResults.length;i++) {
		exports.getPluginById(authResults[i].pluginid, doneWithPlugin);
	}

	let plugins = db.getCollection('plugins');
	let pluginResults = plugins.find({'author': author});

	total += pluginResults.length;
	for (let i=0;i<pluginResults.length;i++) {
		exports.getPluginById(pluginResults[i].id, doneWithPlugin);
	}

	doneWithPlugin(null,null);
};

/**
 * Get all the plugins in a category
 * @param category
 * @param options
 * @param callback
 */
exports.getPluginsInCategory = function (category, options, callback) {
	let plugins = db.getCollection('plugins');
	let results = plugins.find({'$and': [{'status': {'$gte': 1}}, {'category': category}]});
	parseOptions(results, options);
	results = clearFields(results);
	callback(null, {rows: results});
};

/**
 * Clears the processing Log
 * @param id
 * @param callback
 */
exports.clearLog = function (id, callback) {
	let plugins = db.getCollection('plugins');
	let results = plugins.by('id', id);
	if (results) {
		results.processing_log = '';
		plugins.update(results);
	}
	callback();
};

/**
 * Update Processing Log
 * @param id
 * @param log
 * @param callback
 */
exports.addLog = function (id, log, callback) {
	let plugins = db.getCollection('plugins');
	let results = plugins.by('id', id);
	if (results) {
		results.processing_log = results.processing_log + "\r\n" + log;
		plugins.update(results);
	}
	if (typeof callback === 'function') { callback(); }
};

/**
 * Mark a plugin as disabled
 * @param id
 * @param log
 * @param callback
 * @param disableValue
 */
exports.disablePlugin = function (id, log, callback, disableValue) {
	if (disableValue == null) {
		disableValue = -1;
	}

	let plugins = db.getCollection('plugins');
	let results = plugins.by('id', id);
	if (results) {
		results.processing_log = '';
		results.status = disableValue;
		plugins.update(results);
	}
	callback({status: disableValue});
};

/**
 * Gets all the plugins that need a stats update
 * @param callback
 */
exports.getPluginsForStats = function(callback) {
	const newDate = new Date().toISOString().substr(0, 10);
	let plugins = db.getCollection('plugins');
	let results = plugins.find({'$and': [{'status': 1}, {'last_updated': {'$lte':  newDate}}]});
	callback(null, {rows: results});
};

/**
 * Finds any plugin records that need to be processed
 * @param id
 * @param count
 * @param callback
 */
exports.getNextPluginsToProcess = function (id, count, callback) {
	let plugins = db.getCollection('plugins');

	// Reset anything that may have crashed back to be ready to be processed
	plugins.updateWhere(
		(rec) => {
			return rec.processing_id === id;
		},
		(update) => {
			update.processing_id = 0;
			update.processing_count = update.processing_count + 1;
			return update;
		}
	);

	// Only tag a certain number of records for processing
	let counter = 0;
	plugins.updateWhere(
		(rec) => {
			if (counter >= count) { return false; }
			if (rec.processing_id === 0 && rec.status >= -1 && rec.processing_count < 3) {
				counter++;
				return true;
			}
			return false;
		},
		(update) => {
			update.processing_id = id;
			return update;
		}
	);

	let results = plugins.find({processing_id: id});
	callback(null, {rows: results});

};

/**
 * Saves a new/updated NPM record
 * @param record
 * @param callback
 */
exports.saveNPMRecord = function (record, callback) {


		getOrCreatePluginRecord(record.name, function (err, results) {

			let fields = ["id"], values = [results.id], counter = 0, fieldCount = 1;
			const fieldDone = function (field, value) {
				counter++;
				if (field) {
					fields.push(field);
					values.push(value);
				}
				if (counter === fieldCount) {
					if (config.debugging) {
					    //console.log("FV:", fields, values);
					}
					updateQuery(results, "plugins", fields, values, function (err, changes) {
						if (err) {
							console.error("Error", err, err.stack);
							db.saveDatabase(() => {
								process.exit(0);
							});
						}
						callback(null, changes);
					});
				}
			};

			if (record['dist-tags']) {

				if (record['dist-tags'].latest !== results.version) {
					fieldCount += 4;
					fieldDone('version', record['dist-tags'].latest);

					// Reset Processing so any other changes will be picked up
					fieldDone('processing_status', 0);
					fieldDone('processing_count', 0);
					fieldDone('processing_id', 0);
				} else {
					// SHORT CIRCUIT of this is the same version!!!
					// NO Need to process anything else.  ;-)
					callback(null, false);
					return;
				}
			}


			if (record.maintainers && record.maintainers.length) {
				fieldCount++;
				updateLinkRecords("pluginmaintainers", results.id, record.maintainers, fieldDone);

			}
			if (record.contributors && record.contributors.length) {
				fieldCount++;
				updateLinkRecords("plugincontributors", results.id, record.contributors, fieldDone);
			}


			if (record.description && record.description !== results.description) {
				fieldCount++;
				fieldDone("description", record.description);
			}

			const repo = figureOutRepo(record.repository, record.bugs);

			// NativeScript is pointing there templates to the main repo, not valid!
			// So we have to clear it; as it is invalid
			if (repo && repo.fullPath === "Nativescript/Nativescript") {
				if (record.name !== "nativescript") {
					repo.fullPath = '';
				}
			}

			if (repo && (repo.site !== results.repo_site || repo.fullPath !== results.repo_url)) {
				fieldCount += 2;
				fieldDone("repo_site", repo.site);
				fieldDone("repo_url", repo.fullPath);
			}

			if (record.author && record.author.email) {
				fieldCount++;

				const authorRepo = figureOutAuthorRepo(record.author.url, repo);
				getOrCreateAuthorRecord(record.author.name, record.author.email, authorRepo, function (err, data) {
					fieldDone("author", data);
				})
			}

			// Some licenses are and object, switch to the actual license
			if (record.license && record.license.type) {
				record.license = record.license.type;
			}

			if (record.license && record.license !== results.license) {
				fieldCount++;
				fieldDone('license', record.license);
			}

			if (record.keywords) {
				const keywords = record.keywords.join(',');
				if (keywords !== results.keywords) {
					fieldCount++;
					fieldDone('keywords', keywords);
				}
			}

			// Add our Cateloging Date
			fieldCount += 2;
			const updateDate = new Date().toISOString();
			fieldDone('catalog_date', updateDate);
			fieldDone('last_updated', updateDate);

			fieldDone();

		});

};

/**
 * Updates a plugin record
 * @param id
 * @param newData
 * @param callback
 */
exports.updatePlugin = function (id, newData, callback) {
	let plugins = db.getCollection('plugins');
	let result = plugins.by('id', id);
	if (result === null) {
		console.error("updatePlugin: Unable to find the plugin record:", id);
		callback();
	}

	let counter = 0;
	for (let key in newData) {
		if (newData.hasOwnProperty(key)) {
			counter++;
			result[key] = newData[key];
		}
	}

	// No need to do anything if there is no data to update
	if (counter > 0) {
		plugins.update(result);
	}
	callback();

};

/**
 * Gets or creates a record id based on name
 * @param name
 * @param email
 * @param site
 * @param callback
 */
function getOrCreateAuthorRecord(name, email, site, callback) {
	let authors = db.getCollection('authors');
	let results = authors.findOne({'email': email});
	if (results === null) {
		let newRec = {
			id: uuid.v4(),
			name: name,
			email: email,
			website: site,
			plugins: 0,
			assists: 0,
			total_score: 0,
			status: 0
		};
		authors.insert(newRec);
		results = newRec;
	}
	callback(null, results.id);
}

/**
 * Load or Create a new plugin record
 * @param client
 * @param name
 * @param callback
 */
function getOrCreatePluginRecord( name, callback) {
	let plugins = db.getCollection('plugins');
	let results = plugins.findOne({'name': name});
	if (results === null) {
		let newRec = {id: uuid.v4(), name: name, plugin_size: 0, marketplace_score: 0, user_score: 0, has_typings: false,
			other_plugin_info: 0, npm_downloads: 0, git_stars: 0, status: 0, processing_status: 0, processing_id: 0,
			processing_count: 0, overrides: {}, marketplace_issues: 0, total_releases: 0, npm_download_info: {},
			git_issues: 0, npm_downloads_day: 0, npm_downloads_week: 0, npm_downloads_month: 0, os_scoring: 0
		};
		plugins.insert(newRec);
		results = plugins.by('id', newRec.id);
	}
	callback(null, results);
}

/**
 * Updates a record from the fields/values
 * @param record
 * @param table
 * @param fields
 * @param values
 * @param callback
 */
function updateQuery(record, table, fields, values, callback) {

	// No fields to update
	if (fields.length <= 1) {
		callback(null, false);
		return;
	}

	// Update the fields
	for (let i = 1; i < fields.length; i++) {
		record[fields[i]] = values[i];
	}

	// Save the Record
	let tableData = db.getCollection(table);
	tableData.update(record);

	callback(null, true);
}

/**
 * Update the linking tables
 * @param table
 * @param pluginId
 * @param data
 * @param callback
 */
function updateLinkRecords(table, pluginId, data, callback) {
		if (config.debugging) {
			console.log("UpdateLinkRecords...", table);
		}

		let tableCollection = db.getCollection(table);

		let matched = 1, counter = 0, toBeDeletedIds = [], validIds = [];
		const doneWithLinking = function () {
			counter++;

			if (matched === counter) {

				// Delete any Authors no longer Linked to the Plugin
				if (toBeDeletedIds.length > 0) {
					tableCollection.removeWhere((rec) => {
						if (rec.pluginid !== pluginId) {
							return false;
						}
						return toBeDeletedIds.indexOf(rec.authorid) >= 0;
					});
				}
				callback();
			}
		};


		let results = tableCollection.find('pluginid',pluginId);

		// Track both valid ids, and toBeDeletedId's
		for (let i = 0; i < results.length; i++) {
				toBeDeletedIds.push(results[i].authorid);
				validIds.push(results[i].authorid);
		}


		// Create any new author and linking records, and figure out which records should be deleted
		for (let i = 0; i < data.length; i++) {
			if (data[i].email) {
				matched++;
				getOrCreateAuthorRecord(data[i].name, data[i].email, "", function (err, authorId) {

					// Check to see if the user is still in the to be deleted list
					const idx = toBeDeletedIds.indexOf(authorId);
					if (idx >= 0) {
						// Found the record already existing, so we don't want to delete it; so clear it out of the list.
						toBeDeletedIds.splice(idx, 1);
						doneWithLinking();
					} else {
						// Author didn't already exist, so see if we have already added the linking it...
						if (validIds.indexOf(authorId) === -1) {
							validIds.push(authorId);
							tableCollection.insert({pluginid: pluginId, authorid: authorId});
						}
						doneWithLinking();
					}
				});
			}
		}

	    // THIS MUST be here, it runs to clear the extra count...
		doneWithLinking();
}

/**
 * Figure out the repo values
 * @returns {*}
 */
function figureOutRepo() {
	for (let i = 0; i < arguments.length; i++) {
		if (arguments[i] != null && arguments[i].url && typeof arguments[i].url.length) {

			const split = arguments[i].url.split("/");
			if (split.length > 4) {
				let repo = {};
				repo.site = split[2].replace("www.", "").replace("git@", "");
				repo.user = split[3];
				repo.name = split[4].replace(".git", "");
				repo.fullPath = split[3] + "/" + repo.name;

				return repo;
			}
		}
	}

	return null;
}

/** Figure out the Author's repo **/
function figureOutAuthorRepo(url, repo) {
	if (url) {
		return url;
	}
	if (!repo) {
		return "";
	}

	return "https://" + repo.site + "/" + repo.user;
}

exports.setDataUpdatedDate = function() {
	let settings = db.getCollection('settings');
	let rec = settings.by('id',1);
	rec.last_updated = new Date().toISOString().substr(0, 10);
	settings.update(rec);
};

exports.getDataUpdatedDate = function() {
	let settings = db.getCollection('settings');
	let rec = settings.by('id',1);
	return rec.last_updated;
};

exports.saveDatabase = function(callback) {
	db.saveDatabase(callback);
};

exports.loadDatabase = function(callback) {
	db.loadDatabase(callback);
};

exports.close = function(callback) {
	db.close(() => {
		if (config.mongoDB) {
			updateMongoDB(callback);
		} else {
			if (typeof callback === 'function') {
				callback();
			}
		}
	})
};

let _watchTimer = null;
exports.watch = function(callback) {
	if (!fs.existsSync('database.db')) {
		setTimeout(() => { exports.watch(callback); }, 5000);
		return;
	}
  fs.watch("database.db", (eventType, fileName) => {
  	if (dbChangedByUs > 0) { return; }
  	if (eventType === "rename") { return; }
  	console.log("EventType", eventType, fileName);
  	if (typeof callback === 'function') {
		if (_watchTimer !== null) {
			clearTimeout(_watchTimer);
		}
		_watchTimer = setTimeout(callback, 5000);
	}
  });
};

exports.getRow = function(table, id, callback) {
	let collection = db.getCollection(table);
	if (!collection) { callback(null, 'Wrong Table'); }
	let row = collection.by('id', id);
	if (!row) { callback(null, 'Wrong id'); }
	callback(null, row);
};

exports.getValue = function(table, id, field, callback) {
	let collection = db.getCollection(table);
	if (!collection) { callback(null, 'Wrong Table'); }
	let row = collection.by('id', id);
	if (!row) { callback(null, 'Wrong id'); }
	callback(null, row[field]);
};

exports.setValue = function(table, id, field, value) {
	let collection = db.getCollection(table);
	if (!collection) { return; }
	let row = collection.by('id', id);
	if (!row) { return; }
	if (Number.isInteger(row[field])) {
		row[field] = parseInt(value,10);
	} else if (typeof row[field] === 'boolean') {
		row[field] = value === "1" ? true : (value === "true");
	} else {
		row[field] = value;
	}

	collection.update(row);
	dbChangedByUs++;
	db.saveDatabase(() => {
		setTimeout(() => { dbChangedByUs--;}, 1000);
	});
};