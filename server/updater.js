/**********************************************************************************
 * (c) 2016, Master Technology
 *
 * Any questions please feel free to email me or put a issue up on the github repo
 * Version 0.0.1                                      Nathan@master-technology.com
 *********************************************************************************/
"use strict";

const fs = require('fs');
const http = require('https');
const pgsql = require("./pgsql");
const oboe = require("oboe");

// By default we just pull a single days record
let downloadType = "yesterday";
if (process.argv[2] && process.argv[2].toLowerCase() === "all") {
    downloadType = "all";
}

console.log("Downloading", downloadType);

/**
 * Starts the download then hands off data to each part of the process
 */
download("https://registry.npmjs.org/-/all/static/"+downloadType+".json", "npm.json")
    .then(function() {
        console.log("Done Downloading");
        return processJSON();
    })
    .then(function(valid) {
       console.log("Found", valid.length, "records...");
       return processRecords(valid);
    })
    .then(function() {
        console.log("Done with all records");
        process.exit(0);
    })
    .catch(function(err) {
        console.log("Error", err, err.stack);
    });




/**
 * Start the processing of the valid records file
 * @param valid
 * @returns {Promise}
 */
function processRecords(valid) {

    return new Promise(function(resolve) {

        const totalRecords = valid.length;
        let currentRecord = -1;

        const updateRecord = function(currentRecord, done) {
            console.log("Processing ", currentRecord.name);
            pgsql.saveNPMRecord(currentRecord, function() {
			console.log("Done with: ", currentRecord.name);
                if (currentRecord % 10 === 0) {
                    setTimeout(done, 0);

                } else {
                    done();
                }
            });
        };

        const processRec = function () {
            currentRecord++;
            if (currentRecord === totalRecords) {
                resolve();
                return;
            }
            const curRec = valid[currentRecord];
            updateRecord(curRec, processRec)
        };
        processRec();
    });
}

/**
 * Search through all the NPM data and see what are potentially valid plugins from it
 * @returns {Promise}
 */
function processJSON() {
	return new Promise(function (resolve) {
		oboe(fs.createReadStream('./npm.json'))
		.node('!.*', function (curData) {

			// Does the name start with it?
			if (curData.name && curData.name.toLowerCase().startsWith("nativescript-")) {
				// Return means we like the record
				return curData;
			}

			// Is NativeScript used inside the description?
			if (curData.description && curData.description.toLowerCase().indexOf("nativescript") > -1) {
				// Return means we like the record
				return curData;
			}

			if (curData.keywords) {
				for (let k = 0; k < curData.keywords.length; k++) {
					if (curData.keywords[k].toLowerCase() === "nativescript") {
						// Return means we like the record
						return curData;
					}
				}
			}

			// Means we don't want the record
			return oboe.drop;
		}).done(function (data) {
			let validData = [];

			// Dropped Data has a ton of NULL records, so lets clean it up.
			if (Array.isArray(data)) {
				for (let i = 0; i < data.length; i++) {
					if (data[i] != null) {
						validData.push(data[i]);
					}
				}
			} else {
				for (let key in data) {
					if (data.hasOwnProperty(key)) {
						validData.push(data[key]);
					}
				}
			}
			resolve(validData);
		});
	})
}

// Used to Test w/o re-downloading file
function fakeDownload() {
    return new Promise(function(resolve) {
        resolve();
    });
}

/**
 * Downloads a file
 * @param url - url to download
 * @param dest - file to save
 * @returns {Promise}
 */
function download(url, dest) {
    return new Promise(function(resolve, reject) {
        const file = fs.createWriteStream(dest);
        const request = http.get(url, function (response) {
            response.pipe(file);
            file.on('finish', function () {
                file.close(resolve);
            });
        }).on('error', function (err) { // Handle errors
            fs.unlinkSync(dest);
            reject(err);
        });
        request.setTimeout(20000, function () {
            console.log("Aborting request");
            request.abort();
        });
    });
}