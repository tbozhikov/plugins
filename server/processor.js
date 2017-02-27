/**********************************************************************************
 * (c) 2016-2017, Master Technology
 *
 * Any questions please feel free to email me or put a issue up on the github repo
 * Version 0.0.2                                      Nathan@master-technology.com
 *********************************************************************************/
"use strict";

const fs = require('fs');
const pgsql = require('./pgsql');
const request = require('request');

// These are our hard coded automatic Developer tools, because they do not have a `nativescript` key
const nativescriptDeveloperTools = ['nativescript','tns-core-modules','tns-android','tns-ios','angular2-seed-advanced','nativescript-hook'];

// The Scoring System
const SCORING = require('./scoring');

// Our configuration files
const config = require('./config').processing;

// Keep track of all our static categories; eliminate SQL lookups for this while doing all our work
let categories = {};

// This is our default Request information
const defaultRequestOptions = {
	json: true,
	timeout: config.timeout
};


/**
 * We want to have a delay between each plugin processed to allow the machine time for other things.
 */
function scheduleNextPlugin(long) {
	if (config.debugging) {
		console.log("Finished processing plugin group, scheduling next set.\r\n");
	}

	if (long === true) {
		processPluginNPMStats(function() {
			process.exit(0);
		});
		//setTimeout(handlePlugins, config.longWaitTime);
	} else {
		setTimeout(handlePlugins, config.waitTime);
	}
}


/**
 * This starts handling the plugins, this is the STARTUP routine
 */
function handlePlugins() {
	let pluginCount = 0, pluginCounter = 0;

	const finishedPlugin = function() {
		pluginCounter++;
		if (pluginCounter >= pluginCount) {
			scheduleNextPlugin();
		}
	};

	// Ask database for the next batch of plugins
	pgsql.getNextPluginsToProcess(config.worker, config.maxPlugins, function(err, results) {
		if (config.debugging) { console.log("Tagged and processing", results.rows.length); }

		// if we have no valid rows, then schedule the next set, and exit this routine
		if (results.rows.length === 0) {
			scheduleNextPlugin(true);
			return;
		}

		// We have a batch, lets track how many we have and start processing all of them
		pluginCount = results.rows.length;
		for (let i=0;i<pluginCount;i++) {
			getPluginResources(results.rows[i], finishedPlugin);
		}
	});
}

/**
 * Handle a Data Request
 * @param data - The current Plugin Data
 * @param url - The URL to load
 * @param options - our options  (optional)
 * @param processCallback - the routine to call to process the data
 * @param doneCallback - the routine to call when we are done processing the data
 */
function handleRequest(data, url, options, processCallback, doneCallback) {
	if (typeof options === 'function') {
		doneCallback = processCallback;
		processCallback = options;
		options = {};
	}

	const currentRequest = Object.assign({}, defaultRequestOptions, options);
	currentRequest.url = url;

	if (config.debugging) {
	   console.log("Downloading url ", url, "for package:", data.name);
        }

	request.get(currentRequest, function(err, response, body) {
		if (err) {
			console.error("Error on retrieving data for:", data.name, err);
			pgsql.addLog(data.id, "Unable to retrieve " + url, doneCallback);
			return;
		}

		if (config.debugging) {
	//	    console.log("Response is:", response.statusCode, "data:", body);
		}

		if (response.statusCode !== 200) {
			// No errors thrown for the demo check
			if (url.indexOf("raw.githubusercontent.com") === -1) {
				console.error(currentRequest);
				console.error("Response != 200 on retrieving data for:", url, "Got:", response.statusCode);
				pgsql.addLog(data.id, "Non 200 (" + response.statusCode + ") response on " + url, doneCallback);
			} else {
				doneCallback();
			}
			return;
		}

		processCallback(data, body, doneCallback);
	});
}


/**
 * Gets all the plugin data and collates it before saving it back to the database
 * @param pluginData - Existing plugin data
 * @param finishedCallback - when done with all the resources
 */
function getPluginResources(pluginData, finishedCallback) {

	let requestCount = 2;
	let requestCounter = 0;
	let newData = {};

	if (config.debugging) {
		console.log("Getting Plugin Resources for", pluginData.name);
	}

	const completed = function(data) {
		requestCounter++;

		// Collate all the Data
		for (let key in data) {
			if (data.hasOwnProperty(key)) {
				if (newData[key]) {
					if (newData[key] !== data[key]) {
						if (key === 'marketplace_issues') {
							newData[key] += data[key];
						} else if (key === 'status') {
							// Disabling of plugin has the highest priority, this means a check failed in one of the sub-systems
							if (newData[key] === -1) { continue; }
							if (data[key === -1]) { newData[key] = -1; }
						}
						console.log("Conflicting information for", pluginData.name, key, newData[key], '!=', data[key]);
					}
				} else {
					newData[key] = data[key];
				}
			}
		}

		if (requestCounter >= requestCount) {
			if (config.debugging) { console.log("Writing data", pluginData.name); }
			// Reset Processing Values
			if (pluginData.processing_count > 0) {
				newData.processing_count = 0;
			}

			newData.processing_id = -1;

			handleOverrides(pluginData, newData);

			// Setup the last changed date
			newData.last_updated = new Date().toISOString();

			// Handle Scoring
			const score = SCORING.score(pluginData, newData);
			if (score !== pluginData.marketplace_score) {
				newData.marketplace_score = score;
			}

			// Update the database
			pgsql.updatePlugin(pluginData.id, newData, finishedCallback);
		}
	};

	// Convert the JSON Text into JSON Object
	let overrides = {};
	try {
		overrides = JSON.parse(pluginData.overrides);
	}
	catch (err) {
		overrides = {};
	}
	pluginData.overrides = overrides;

	// Convert the NPM Downloads TEXT to object
	let npm_downloads = {};
	try {
		npm_downloads = JSON.parse(pluginData.npm_download_info);
	}
	catch (err) {
		npm_downloads = {};
	}
	pluginData.npm_download_info = npm_downloads;


	pgsql.clearLog(pluginData.id, function() {
		handleRequest(pluginData, "https://registry.npmjs.com/" + pluginData.name, handleNPM, completed);

		let startDate = "2014-01-01";
		//noinspection JSUnresolvedVariable
		if (pluginData.created_date) {
			//noinspection JSUnresolvedVariable
			let tempDate = new Date();
			tempDate.setTime(pluginData.created_date);
			startDate = tempDate.toISOString().substr(0,10);
		}
		handleRequest(pluginData, "https://npm-stat.com/downloads/range/"+startDate+":"+new Date().toISOString().substr(0, 10)+"/"+pluginData.name, handleNPMStats, completed);

		//noinspection JSUnresolvedVariable
		if (pluginData.repo_site === "github.com" && pluginData.repo_url) {
			requestCount+=1;

			//noinspection JSUnresolvedVariable
			handleRequest(pluginData, "https://api.github.com/repos/" + pluginData.repo_url, {
				headers: { 'User-Agent': 'request' },
				auth: {
					'user': config.github.username,
					'pass': config.github.password
				}
			}, handleGIT, completed);

			// If we haven't already checked for a Demo url; then do so
			if (!pluginData.demo_url) {
				requestCount++;
				handleRequest(pluginData, "https://raw.githubusercontent.com/" + pluginData.repo_url + "/master/demo/package.json", handleDemo, completed);
			}
		} else if (pluginData.repo_site === "bitbucket.org") {
			// TODO: Add bitbucket parsing as part of v2
		}
	});
}

function handleOverrides(oldData, newData) {
	const overrides = oldData.overrides;
	for (let key in overrides) {
		if (!overrides.hasOwnProperty(key)) { continue; }
		if (typeof oldData[key] !== 'undefined') {
			if (oldData[key] !== overrides[key]) {
				newData[key] = overrides[key];
			}
		} else {
			console.log("Override key", key, "on plugin", oldData.name, "is invalid!");
		}
	}

}

function handleDemo(oldData, responseData, finishedCallback) {
	if (config.debugging) { console.log("Handling Demo: ", oldData.name); }
	if (responseData && responseData.nativescript) {
		//noinspection JSUnresolvedVariable
		finishedCallback({demo_url: "https://github.com/"+oldData.repo_url+"/master/demo/"});
	} else {
		finishedCallback();
	}
}

function processPluginNPMStats(callback) {

	// Only need to calculate this once.
	let endDate = new Date().toISOString().substr(0, 10);

	// Load any records that weren't processed today.
	pgsql.getPluginsForStats(function(err, results) {

		let finishedCount = 0, finishedTotal = results.rows.length, recordId;

		if (config.debugging) {
			console.log("NPM Stats Record", finishedTotal);
		}

		let recordDone = function() {
			finishedCount++;
			if (finishedCount === finishedTotal) {
				callback();
			} else {
				if ((finishedCount % config.maxPlugins) === 0) {
					setTimeout(function() {
						handleNextPlugin(results.rows[finishedCount]);
					}, config.waitTime);
				} else {
					handleNextPlugin(results.rows[finishedCount]);
				}
			}
		};

		let completed = function(newData) {

			// Set the last updated date
			newData.last_updated = endDate;

			// Update this plugin
			pgsql.updatePlugin(recordId, newData, recordDone);
		};


		// This handles a single plugin
		let handleNextPlugin = function(pluginData) {
			recordId = pluginData.id;
			let stats = {};
			try {
				stats = JSON.parse(pluginData.npm_download_info);
			} catch (err) {
				stats = {};
			}
			pluginData.npm_download_info = stats;

			let startDate = "2014-01-01";
			//noinspection JSUnresolvedVariable
			if (pluginData.created_date) {
				//noinspection JSUnresolvedVariable
				let tempDate = new Date();
				tempDate.setTime(pluginData.created_date);
				startDate = tempDate.toISOString().substr(0,10);
			}
			handleRequest(pluginData, "https://npm-stat.com/downloads/range/"+startDate+":"+endDate+"/"+pluginData.name, handleNPMStats, completed);
		};

		// Start processing the first plugin
		if (results.rows.length) {
			handleNextPlugin(results.rows[0]);
		} else {
			callback();
		}

	});
}

function handleNPMStats(oldData, responseData, finishedCallback) {

	if (config.debugging) {
		console.log("Handling NPMStats for", oldData.name);
	}

	let count = 0, downloadInfo = oldData.npm_download_info, changedDownloads = false;
	if (responseData.downloads && Array.isArray(responseData.downloads)) {
		for (let i = 0; i < responseData.downloads.length; i++) {
			const curDay = responseData.downloads[i];
			count += curDay.downloads;
			if (downloadInfo[curDay.day] !== curDay.downloads) {
				downloadInfo[curDay.day] = curDay.downloads;
				changedDownloads = true;
			}
		}
	}


	let newData = {};

	// Save the days array
	if (changedDownloads) {
		newData.npm_download_info = downloadInfo;
	}


	if (oldData.npm_downloads !== count && count > 0) {
		newData.npm_downloads = count;
	}

	// Generate our Day/Week/Month stats
	//------------------------------------
	let curMonthCount = 0, curWeekCount = 0, curDayCount = 0;
	let date = new Date();
	date.setMonth(date.getMonth() - 1);
	const curMonthString = date.toISOString().substring(0, 10);
	date = new Date();
	date.setDate(date.getDate() - 7);
	const curWeekString = date.toISOString().substring(0, 10);
	date = new Date();
	date.setDate(date.getDate() - 1);
	const curDayString = date.toISOString().substring(0, 10);

	for (let day in downloadInfo) {
		if (!downloadInfo.hasOwnProperty(day)) { continue; }
		if (day >= curMonthString) {
			curMonthCount += downloadInfo[day];
		}
		if (day >= curWeekString) {
			curWeekCount += downloadInfo[day];
		}
		if (day >= curDayString) {
			curDayCount += downloadInfo[day];
		}
	}
	if (oldData.npm_downloads_day !== curDayCount) {
		newData.npm_downloads_day = curDayCount;
	}
	if (oldData.npm_downloads_week !== curWeekCount) {
		newData.npm_downloads_week = curWeekCount;
	}
	if (oldData.npm_downloads_month !== curMonthCount) {
		newData.npm_downloads_month = curMonthCount;
	}


	finishedCallback(newData);
}

function handleNPM(oldData, responseData, finishedCallback) {

	if (config.debugging) {	console.log("Handling NPM for", oldData.name); }

	//noinspection JSUnresolvedVariable
	if (!responseData["dist-tags"] || !responseData['dist-tags'].latest)  {
		if (responseData.time && responseData.time.unpublished) {
			pgsql.disablePlugin(oldData.id, "Process NPM Data: unpublished", finishedCallback, -10);
		} else {
			console.error("Unable to find dist-tags for", oldData.name);
			//console.log(responseData);
			pgsql.disablePlugin(oldData.id, "Process NPM Data: unable to find latest distribution tags", finishedCallback);
		}
		return;
	}

	//noinspection JSUnresolvedVariable
	const curData = responseData.versions[responseData['dist-tags'].latest];
	let newData = {}, platforms=0, marketplace_issues = 0;

	// Get total number of releases
	let total_releases = 0;
	for (let key in responseData.versions) {
	    if (responseData.versions.hasOwnProperty(key)) { total_releases++; }
	}
	if (oldData.total_releases !== total_releases) {
		newData.total_releases = total_releases;
	}

	if (oldData.name.indexOf("-template-") > 0) {
		// If these have -template- in them, we automatically put them in the Template category
		platforms = config.windowsPlatformReleased ? 7 : 3; // iOS, Android, and Windows - Platform Independent
		if (!curData.nativescript) {
			curData.nativescript = {};
		}
		curData.nativescript.category = "Templates";
	}
	else if (nativescriptDeveloperTools.indexOf(oldData.name) >= 0 || oldData.name.indexOf("-dev-") > 0) {
		// If these have -dev- in them we put them in the developer tools category
		platforms = config.windowsPlatformReleased ? 7 : 3; // iOS, Android, and Windows - Platform Independent
		if (!curData.nativescript) {
			curData.nativescript = {};
		}
		curData.nativescript.category = "Developer";
	} else {

		if (!curData.nativescript) {
			console.error("Not tagged for NativeScript: ", oldData.name);
			pgsql.disablePlugin(oldData.id, "No valid platforms, requires a nativescript key.", finishedCallback);
			return;
		}

		if (curData.nativescript.platforms) {

			// Check Platforms
			// --------------------------------------------
			if (curData.nativescript.platforms.android) {
				platforms |= 1;
			}
			if (curData.nativescript.platforms.ios) {
				platforms |= 2;
			}
			if (config.windowsPlatformReleased && curData.nativescript.platforms.windows) {
				platforms |= 4;
			}
			if (curData.nativescript.platforms.androidDummyWrapper) {
				platforms |= 8;
				// Remove the Android Platform as this is only a Dummy Wrapper
				if ((platforms & 1) === 1) { platforms -= 1; }
			}
			if (curData.nativescript.platforms.iosDummyWrapper) {
				platforms |= 16;
				// Remove the ios Platform as this is only a Dummy Wrapper if this key exists
				if ((platforms & 2) === 2) { platforms -= 2; }
			}
			if (curData.nativescript.platforms.windowsDummyWrapper) {
				if (config.windowsPlatformReleased) { platforms |= 32; }
				// Remove the ios Platform as this is only a Dummy Wrapper if this key exists
				if ((platforms & 4) === 4) { platforms -= 4; }
			}

		} else {
			pgsql.addLog(oldData.id, "Malformed package.json file -- missing `nativescript.platforms` key (-5 points).");
			marketplace_issues |= SCORING.MALFORMED_PACKAGE_1;


			// Check Platforms off the main key
			// --------------------------------------------
			if (curData.nativescript.android) {
				platforms |= 1;
			}
			if (curData.nativescript.ios) {
				platforms |= 2;
			}
			if (config.windowsPlatformReleased && curData.nativescript.windows) {
				platforms |= 4;
			}

			if (platforms === 0) {
				platforms = 3;
				pgsql.addLog(oldData.id, "Malformed package.json -- No platforms listed at all.  (-5 points)");
				marketplace_issues |= SCORING.MALFORMED_PACKAGE_2;
			}

		}
	}

	if (oldData.os_support !== platforms) {
		newData.os_support = platforms;

		// We don't score a "guessed" platform
		if ((marketplace_issues & (SCORING.MALFORMED_PACKAGE_2)) === 0) {
			newData.os_scoring = platforms;
		} else {
			newData.os_scoring = 0;
		}
	}



	// Get Read Me
	// ---------------------------------------------
	if (responseData.readme) {
		if (oldData.readme !== responseData.readme) {
			newData.readme = responseData.readme;
		}
		if (newData.readme === "ERROR: No README data found!") {
			marketplace_issues |= SCORING.MISSING_README;
			newData.readme = "No README file for " + oldData.name +" consider helping out!";
		}
	} else {
		newData.readme = "No README file for " + oldData.name +" consider helping out!";
		marketplace_issues |= SCORING.MISSING_README;

	}


	// Get Demo URL
	// --------------------------------------------
	//noinspection JSUnresolvedVariable
	if (curData.nativescript.demo && curData.nativescript.demo != oldData.demo_url) {
		//noinspection JSUnresolvedVariable
		newData.demo_url = curData.nativescript.demo;
	}

	// Get Category
	// --------------------------------------------
	if (curData.nativescript.category) {
		const cat = categories[curData.nativescript.category.toLowerCase()];
		if (cat) {
			if (oldData.category !== cat) {
				newData.category = cat;
			}
		} else {
			console.error("Invalid category", curData.nativescript.category);
			pgsql.addLog(oldData.id, "Invalid category: "+curData.nativescript.category);
		}
	}

	// Check for Modified and Created dates
	// ----------------------------------------------
	if (responseData.time) {
		if (!oldData.created_date) {
			//noinspection JSUnresolvedVariable
			if (responseData.time.created) {

				//noinspection JSUnresolvedVariable
				const createDate = new Date(responseData.time.created);
				newData.created_date = createDate.getTime();
			}
		}

		if (responseData.time.modified) {
			const modifiedDate = new Date(responseData.time.modified);
			if (responseData.modified_date !== modifiedDate.getTime()) {
				newData.modified_date = modifiedDate.getTime();
			}
		}
	}

	// Set Typings
	// ----------------------------------------------
	//noinspection JSUnresolvedVariable
	const hasTypings = !!curData.typings;
	if (hasTypings !== oldData.has_typings) {
		newData.has_typings = hasTypings;
	}

	// Get the issues url
	// ----------------------------------------------
	//noinspection JSUnresolvedVariable
	if (curData.bugs) {
		//noinspection JSUnresolvedVariable
		if (curData.bugs.url && curData.bugs.url !== oldData.issues_url) {
			//noinspection JSUnresolvedVariable
			newData.issues_url = curData.bugs.url;

		} else {
			//noinspection JSUnresolvedVariable
			if (typeof curData.bugs.substr === 'function' && curData.bugs !== oldData.issues_url) {
						//noinspection JSUnresolvedVariable
						newData.issues_url = curData.bugs;
					}
		}
	}

	// Setup the issues found
	if (marketplace_issues > 0) {
		newData.marketplace_issues = marketplace_issues;
	}


	// Set Status to being enabled
	// ----------------------------------------------
	if (oldData.status === 0) {
		newData.status = 1;
	}


	if (config.debugging) {
	    // console.log("OldData:", oldData);
	    // console.log("NewData", newData);
	}

	// All done processing NPM Log
	finishedCallback(newData);
}

function handleGIT(oldData, responseData, finishedCallback) {

	if (config.debugging) { console.log("Working on GIT for", oldData.name); }
	//console.log("Git:", responseData);

	// Disable forks by default
	if (responseData.fork || oldData.overrides.fork === true) {
		if (oldData.overrides.fork !== false) {
			pgsql.disablePlugin(oldData.id, "Fork of another project.", finishedCallback);
			return;
		}
	}

	let newData = {};

	// Get the Avatar of the user
	// -------------------------------------------------------
	if (responseData.owner && responseData.owner.avatar_url && responseData.owner.avatar_url !== oldData.git_avatar) {
		newData.git_avatar = responseData.owner.avatar_url;
	}

	// Get the number of open issues
	// -------------------------------------------------------
	if (responseData.open_issues && responseData.open_issues !== oldData.git_issues) {
		newData.git_issues = responseData.open_issues;
	}

	// Get the language of the project
	// -------------------------------------------------------
	if (responseData.language && responseData.language !== oldData.language) {
		newData.language = responseData.language;
	}

	// Get the Size of the project
	// -------------------------------------------------------
	if (responseData.size && responseData.size !== oldData.plugin_size) {
		newData.plugin_size = responseData.size;
	}

	// Get the Stars of the project
	// -------------------------------------------------------
	//noinspection JSUnresolvedVariable
	if (responseData.stargazers_count && responseData.stargazers_count !== oldData.git_stars) {
		//noinspection JSUnresolvedVariable
		newData.git_stars = responseData.stargazers_count;
	}

	// Send back the newly parsed data
	finishedCallback(newData);
}




// --------------------------------------------------------------------------------------
// This actually starts the processing of plugins, we cache the categories, then start
// the first load of plugins
// --------------------------------------------------------------------------------------
pgsql.getCategories(function(err, results) {
	for (let i=0;i<results.rows.length;i++) {
		categories[results.rows[i].name.toLowerCase()] = results.rows[i].id;
	}
	handlePlugins();
});

