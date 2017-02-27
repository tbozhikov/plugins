/**********************************************************************************
 * (c) 2016-2017, Master Technology
 *
 * Any questions please feel free to email me or put a issue up on the github repo
 * Version 0.0.2                                      Nathan@master-technology.com
 *********************************************************************************/
"use strict";

const MISSING_README = 1,
	  MALFORMED_PACKAGE_1 = 2,
	  MALFORMED_PACKAGE_2 = 4,
	  COMPILED_PACKAGES = 8;

function getValue(key, oldData, newData) {
	if (typeof newData[key] !== 'undefined') {
		return newData[key];
	}
	return oldData[key];
}


module.exports = {
	MISSING_README: MISSING_README,
	MALFORMED_PACKAGE_1: MALFORMED_PACKAGE_1,
	MALFORMED_PACKAGE_2: MALFORMED_PACKAGE_2,
	COMPILED_PACKAGES: COMPILED_PACKAGES,

	score: function(oldData, newData) {
		let currentScore = 0;


		let platformCount = 0, dummyCount=0;


		const os_scoring = getValue('os_scoring', oldData, newData);
		if ((os_scoring & 1) === 1) {
			platformCount++;
		}
		if ((os_scoring & 2) === 2) {
			platformCount++;
		}
		if ((os_scoring & 4) === 4) {
			platformCount++;
		}
		if ((os_scoring & 8) === 8) {
			dummyCount++;
		}
		if ((os_scoring & 16) === 16) {
			dummyCount++;
		}
		if ((os_scoring & 32) === 32) {
			dummyCount++;
		}

		if (platformCount === 1) {
			currentScore = 50;
		} else if (platformCount === 2) {
			currentScore = 90;
		} else if (platformCount === 3) {
			currentScore = 120;
		}
		currentScore += (10 * dummyCount);


		if (getValue('category', oldData, newData)) {
			currentScore += 5;
		}

		if (getValue('demo_url', oldData, newData)) {
			currentScore +=  25;
		}

		if (getValue('typings', oldData, newData)) {
			currentScore += 10;
		}

		// Handle Negative Scoring Parts
		const badScoring = getValue('marketplace_issues', oldData, newData);
		if ((badScoring & MISSING_README) === MISSING_README) { currentScore -= 10; }
		if ((badScoring & MALFORMED_PACKAGE_1) === MALFORMED_PACKAGE_1) { currentScore -= 5; }
		if ((badScoring & MALFORMED_PACKAGE_2) === MALFORMED_PACKAGE_2) { currentScore -= 5; }
		if ((badScoring & COMPILED_PACKAGES) === COMPILED_PACKAGES) { currentScore -= 10; }

		return currentScore;
	}
};