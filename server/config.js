/**********************************************************************************
 * (c) 2016-2017, Master Technology
 *
 * Any questions please feel free to email me or put a issue up on the github repo
 * Version 0.0.2                                      Nathan@master-technology.com
 *********************************************************************************/

module.exports =
	{
		server: {
			port: process.env.PORT, // Specific to Modulus
			api: true,				// Activate API handling
			static: true,			// Activate Static Server
			forward: true,			// Forward API requests
			database: 'lokijs'		// Database Driver for server
		},
		lokijs: {
			debugging: true,
			mongoDB: process.env.MONGO
		},
		processing: {
			database: 'lokijs',
			worker: 1,					  // The worker id
			waitTime: 60 * 1000,		  // The down time in between groups of requests
			longWaitTime: 60 * 60 * 1000, // The down time when no plugins remaining to check
			timeout: 20000,				  // The timeout for http request
			maxPlugins: 10,				  // The number of plugins to process at a time
			windowsPlatformReleased: false, // Is windows a released NS target platform
			github: {						// Github credentials to access the API
				username: process.env.GITHUBCREDS,
				password: ""
			},
			debugging: true					// Output debugging key
		},
	};
