/**********************************************************************************
 * (c) 2016, Master Technology
 *
 * Any questions please feel free to email me or put a issue up on the github repo
 * Version 0.0.2                                      Nathan@master-technology.com
 *********************************************************************************/
"use strict";

const verbose = true;

const pg = require('pg');
const config = require("./config").pgsql;


// Setup pgsql Pooling
const pool = new pg.Pool(config);

/***
 * Runs a standard query
 * @param query
 * @param valueOrCallback
 * @param callback
 */
function runQuery(query, valueOrCallback, callback) {
	if (typeof valueOrCallback === 'function') {
		callback = valueOrCallback;
		valueOrCallback = null;
	}
	pool.connect(function (err, client, done) {
		if (err) {
			return console.error('Error fetching client from pool', err);
		}
		client.query(query, valueOrCallback, function (err, results) {
			if (config.debugging && err) {
				console.error(query);
				console.error("SQL Error", err, err.stack);
			}
			done();
			if (callback) {
				callback(err, results);
			}
		});
	});
}

exports.getCategory = function (id, callback) {
	runQuery("SELECT * from categories where id = $1", [id], callback);
};

exports.getCategories = function (callback) {
	runQuery("SELECT * from categories where id != '00000000-0000-0000-0000-000000000000'", callback);
};

exports.getAuthor = function (id, callback) {
	runQuery('SELECT * from authors where id=$1', [id], callback);
};

exports.getAuthors = function (callback) {
	runQuery('SELECT * from authors', callback);
};

exports.search = function (value, options, callback) {
	const newValue = '%' + value.replace('!', '!!').replace('%', '!%').replace('_', '!_').replace('[', '![') + '%';
	const query = "SELECT * from plugins where status >= 1 and (name like $1 escape '!' or description like $1 escape '!' or keywords like $1 escape '!')"+parseOptions(options);
	runQuery(query, [newValue], callback);
};

exports.getPluginCount = function(callback) {
	runQuery('select count(id) as count from plugins where status >= 1', callback);
};

function parseOptions(options) {
	let sql = '';
	if (options.sort) {
		sql += ' order by ' + options.sort;
		if (options.direction) {
			sql += ' ' + options.direction
		}
		sql += ', id asc';
	}
	if (options.offset > 0) {
		sql += ' offset ' + options.offset;
	}
	if (options.limit > 0) {
		sql += ' limit '+options.limit;
	}

	return sql;
}
exports.getAllPlugins = function (options, callback) {
	const query = 'SELECT id, author, catalog_date, category, description, keywords, marketplace_score, modified_date, name, os_support, repo_site, repo_url, status, user_score, version from plugins where status >= 1' + parseOptions(options);
	runQuery(query, callback);
};

exports.getContributorsAndMaintainers = function(id, callback) {
	runQuery("select 'C' as type, authorid from plugincontributors where pluginid = $1 union select 'M' as type, authorid from pluginmaintainers where pluginid = $1", [id], callback);
};

exports.getPluginById = function (id, callback) {

	let donewithPlugin = function(err, data) {
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

	if (id.length !== 36 || id[8] !== '-' || id[13] !== '-' || id[18] !== '-' || id[23] !== '-') {
		let name = id.toLowerCase();
		if (name[0] === '!') {
			name = name.substring(1, name.length);
			runQuery('SELECT * from plugins where name=$1', [name], donewithPlugin);
		} else {
			runQuery('SELECT * from plugins where name=$1 and status >= 1', [name], donewithPlugin);
		}
	} else {
		runQuery('SELECT * from plugins where id=$1', [id], donewithPlugin);
	}
};

exports.getPluginsOfAuthor = function (author, options, callback) {
	const query = "select * from plugins p join pluginmaintainers a on (a.pluginid = p.id) where (p.author = $1 or a.authorid = $1) and status >= 1" + parseOptions(options);
	runQuery(query, [author], callback);
};

exports.getPluginsInCategory = function (category, options, callback) {
	const query = 'SELECT * from plugins where category=$1 and status >= 1'+parseOptions(options);
	runQuery(query, [category], callback);
};

exports.clearLog = function (id, callback) {
	runQuery("update plugins set processing_log='' where id=$1", [id], callback);
};

exports.addLog = function (id, log, callback) {
	runQuery("update plugins set processing_log=concat(processing_log, '\r\n', $1::text) where id=$2", [log.toString(), id], callback);
};

exports.disablePlugin = function (id, log, callback, disableValue) {
	if (disableValue == null) {
		disableValue = -1;
	}
	runQuery("update plugins set processing_log=concat(processing_log, '\r\n', $1::text), status=$3 where id=$2", [log.toString(), id, disableValue], function () {

		// Pass back that the status is now disabled
		callback({status: disableValue});
	});
};

exports.cleanUpRecords = function (callback) {
	pool.connect(function (err, client, done) {
		if (err) {
			return console.error('error fetching client from pool', err);
		}
		client.query('truncate table plugins', function () {
			client.query('truncate table authors', function () {
				client.query('truncate table pluginmaintainers', function () {
					client.query('truncate table plugincontributors', function () {
						done();
						callback();
					});
				});
			});
		});
	});
};

exports.getPluginsForStats = function(callback) {
	const newDate = new Date().toISOString().substr(0, 10);

	runQuery("select id, name, created_date, npm_download_info, npm_downloads, npm_downloads_day, npm_downloads_week, npm_downloads_month from plugins where last_updated < $1 and status=1", [newDate], callback);
};


exports.getNextPluginsToProcess = function (id, count, callback) {
	pool.connect(function (err, client, done) {
		if (err) {
			return console.error('Error fetching client from pool', err);
		}
		tagNextPlugin(client, done, id, count, callback);
	});
};

exports.saveNPMRecord = function (record, callback) {
	pool.connect(function (err, client, done) {
		if (err) {
			return console.error('error fetching client from pool', err);
		}


		getOrCreatePluginRecord(client, record.name, function (err, results) {

			let fields = ["id"], values = [results.id], counter = 0, fieldCount = 1;
			const fieldDone = function (field, value) {
				counter++;
				if (field) {
					fields.push(field);
					values.push(value);
				}
				if (counter === fieldCount) {
					if (config.debugging) {
					    console.log("FV:", fields, values);
					}
					updateQuery(client, "plugins", fields, values, function (err, changes) {
						if (err) {
							console.error("Error", err, err.stack);
							process.exit(0);
						}
						done();
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
					done();
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

	});

};

exports.updatePlugin = function (id, newData, callback) {
	let sql = "update plugins set ";
	let fields = [], values = [id], counter = 1;
	for (let key in newData) {
		if (newData.hasOwnProperty(key)) {
			counter++;
			fields.push(key + "=$" + counter);
			values.push(newData[key]);
		}
	}

	// No need to do anything if there is no data to udpate
	if (fields.length === 0) {
		callback();
		return;
	}

	sql += fields.join(',') + " where id=$1";

	runQuery(sql, values, callback);
};


function tagNextPlugin(client, done, id, count, callback) {
	// Reset anything that may have crashed back to be ready to be processed
	client.query("update plugins set processing_id=0, processing_count=processing_count+1 where processing_id=$1", [id], function (err) {
		if (err) {
			console.error("Error Tag1:", err);
		}
		// set our next item to process
		client.query("update plugins p set processing_id=$1 from (select id from plugins where processing_id=0 and status >= -1 and processing_count < 3 limit " + count + ") sub where sub.id = p.id", [id], function (err) {
			if (err) {
				console.error("Error Tag2:", err);
			}
			// get our next item to process
			client.query("select * from plugins where processing_id=$1", [id], function (err, results) {
				if (err) {
					console.error("Error Tag3:", err);
				}
				done();
				callback(err, results);
			});
		});
	});
}

function getOrCreateAuthorRecord(name, email, site, callback) {
	pool.connect(function (err, client, done) {
		if (err) {
			return console.error('error fetching client from pool', err);
		}

		client.query('select id from authors where email = $1', [email], function (err, result) {
			if (result.rows.length >= 1) {
				done();
				callback(null, result.rows[0].id);
				return;
			}
			client.query('insert into authors (name, email, website) values ($1, $2, $3)', [name, email, site], function (err, results) {
				done();
				getOrCreateAuthorRecord(name, email, site, callback);
			});
		});
	})
}

function getOrCreatePluginRecord(client, name, callback) {
	client.query('select * from plugins where name = $1', [name], function (err, result) {
			if (result.rows.length >= 1) {
				callback(null, result.rows[0]);
				return;
			}
			client.query('insert into plugins (name) values ($1)', [name], function (err, results) {
				getOrCreatePluginRecord(client, name, callback);
			});

		}
	);

}

function updateQuery(client, table, fields, values, callback) {
	if (fields.length <= 1) {
		callback(null, false);
		return;
	}
	let sql = "update " + table + " set ";
	for (let i = 1; i < fields.length; i++) {
		if (i > 1) {
			sql += ",";
		}
		sql += fields[i] + "=$" + (i + 1);
	}
	sql += " where " + fields[0] + "=$1";

	client.query(sql, values, function (err, data) {
		if (err) {
			console.error("updateQuery Error", err, err.stack);
			process.exit(0);
		}
		callback(err, true);
	});
}

function updateLinkRecords(table, pluginId, data, callback) {
	pool.connect(function (err, client, done) {
		if (err) {
			return console.error('error fetching client from pool', err);
		}

		if (config.debugging) {
			console.log("UpdateLinkRecords...", table);
		}

		const ecallback = function (err, data) {
			if (err) {
				console.error(err, err.stack);
				process.exit(1);
			}

			done();
			callback();
		};

		let matched = 0, counter = 0, rowIds = [], validIds = [];
		const doneWithLinking = function (err) {
			if (err) {
				console.error("Linking Error:", err, err.stack);
				process.exit(0);
			}
			counter++;

			if (matched === counter) {

				// Delete any Authors no longer Linked to the Plugin
				if (rowIds.length > 0) {
					let authorQuery = "";
					for (let i = 0; i < rowIds.length; i++) {
						if (i > 0) {
							authorQuery += " or "
						}
						authorQuery += "authorid=$" + (i + 2);
					}
					rowIds.unshift(pluginId);
					client.query("delete from " + table + " where pluginid=$1 and (" + authorQuery + ")", rowIds, ecallback);
				} else {
					ecallback();
				}
			}
		};

		client.query("select authorid from " + table + " where pluginid=$1", [pluginId], function (err, results) {
			if (err) {
				console.error(err, err.stack);
				process.exit(0);
			}

			for (let i = 0; i < results.rows.length; i++) {
				rowIds.push(results.rows[i].authorid);
				validIds.push(results.rows[i].authorid);
			}


			for (let i = 0; i < data.length; i++) {
				if (data[i].email) {
					matched++;
					getOrCreateAuthorRecord(data[i].name, data[i].email, "", function (err, authorId) {
						const idx = rowIds.indexOf(authorId);
						if (idx >= 0) {
							rowIds.splice(idx, 1);
							doneWithLinking();
						} else {
							if (validIds.indexOf(authorId) === -1) {
								validIds.push(authorId);
								client.query("insert into " + table + " (pluginid, authorid) values ($1,$2)", [pluginId, authorId], doneWithLinking);
							} else {
								doneWithLinking();
							}
						}
					});
				}
			}
			if (matched === 0) {
				matched++;
				doneWithLinking();
			}
		});
	});
}


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

function figureOutAuthorRepo(url, repo) {
	if (url) {
		return url;
	}
	if (!repo) {
		return "";
	}

	return "https://" + repo.site + "/" + repo.user;
}

