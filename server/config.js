/**********************************************************************************
 * (c) 2016, Master Technology
 *
 * Any questions please feel free to email me or put a issue up on the github repo
 * Version 0.0.1                                      Nathan@master-technology.com
 *********************************************************************************/

module.exports =
	{
		server: {
			port: process.env.PORT, // Specific to Modulus
			api: false,
			static: true,
			forward: true
		}
	};