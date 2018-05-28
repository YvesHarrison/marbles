//-------------------------------------------------------------------
// Marbles Chaincode Library
//-------------------------------------------------------------------

module.exports = function (enrollObj, g_options, fcw, logger) {
	var marbles_chaincode = {};

	// Chaincode -------------------------------------------------------------------------------

	//check if chaincode exists
	marbles_chaincode.check_if_already_instantiated = function (options, cb) {
		console.log('');
		logger.info('Checking for chaincode...');

		var opts = {
			peer_urls: g_options.peer_urls,
			peer_tls_opts: g_options.peer_tls_opts,
			channel_id: g_options.channel_id,
			chaincode_id: g_options.chaincode_id,
			chaincode_version: g_options.chaincode_version,
			cc_function: 'read',
			cc_args: ['selftest']
		};
		fcw.query_chaincode(enrollObj, opts, function (err, resp) {
			if (err != null) {
				if (cb) return cb(err, resp);
			}
			else {
				if (resp.parsed == null || isNaN(resp.parsed)) {	 //if nothing is here, no chaincode
					if (cb) return cb({ error: 'chaincode not found' }, resp);
				}
				else {
					if (cb) return cb(null, resp);
				}
			}
		});
	};

	//check chaincode version
	marbles_chaincode.check_version = function (options, cb) {
		console.log('');
		logger.info('Checking chaincode and ui compatibility...');

		var opts = {
			peer_urls: g_options.peer_urls,
			peer_tls_opts: g_options.peer_tls_opts,
			channel_id: g_options.channel_id,
			chaincode_id: g_options.chaincode_id,
			chaincode_version: g_options.chaincode_version,
			cc_function: 'read',
			cc_args: ['marbles_ui']
		};
		fcw.query_chaincode(enrollObj, opts, function (err, resp) {
			if (err != null) {
				if (cb) return cb(err, resp);
			}
			else {
				if (resp.parsed == null) {							//if nothing is here, no chaincode
					if (cb) return cb({ error: 'chaincode not found' }, resp);
				}
				else {
					if (cb) return cb(null, resp);
				}
			}
		});
	};


	// Marbles -------------------------------------------------------------------------------

	marbles_chaincode.create_account = function (options, cb) {
		console.log('');
		logger.info('Creating an account...');

		var opts = {
			peer_urls: g_options.peer_urls,
			peer_tls_opts: g_options.peer_tls_opts,
			channel_id: g_options.channel_id,
			chaincode_id: g_options.chaincode_id,
			chaincode_version: g_options.chaincode_version,
			event_urls: g_options.event_urls,
			endorsed_hook: options.endorsed_hook,
			ordered_hook: options.ordered_hook,
			cc_function: 'create_account',
			cc_args: [
				options.args.type_,
				options.args.hash_id,
				//options.args.hash
			],
		};
		fcw.invoke_chaincode(enrollObj, opts, function (err, resp) {
			console.log('invoking create_account');
			if (cb) {
				if (!resp){
					console.log('no response');
					resp = {};
				} 
				resp.id = opts.cc_args[1];			//pass marble id back
				cb(err, resp);
			}
		});
	};

	marbles_chaincode.create_ac_trade = function (options, cb) {
		console.log('');
		logger.info('Creating a trade...');

		var opts = {
			peer_urls: g_options.peer_urls,
			peer_tls_opts: g_options.peer_tls_opts,
			channel_id: g_options.channel_id,
			chaincode_id: g_options.chaincode_id,
			chaincode_version: g_options.chaincode_version,
			event_urls: g_options.event_urls,
			endorsed_hook: options.endorsed_hook,
			ordered_hook: options.ordered_hook,
			cc_function: 'ac_trade_setup',
			cc_args: [
				options.args.type_,
				options.args.hash_id,
				//options.args.hash
			],
		};
		fcw.invoke_chaincode(enrollObj, opts, function (err, resp) {
			if (cb) {
				if (!resp) resp = {};
				resp.id = opts.cc_args[1];			//pass marble id back
				cb(err, resp);
			}
		});
	};

	marbles_chaincode.create_ac_benchmark = function (options, cb) {
		console.log('');
		logger.info('Creating a ac_benchmark...');

		var opts = {
			peer_urls: g_options.peer_urls,
			peer_tls_opts: g_options.peer_tls_opts,
			channel_id: g_options.channel_id,
			chaincode_id: g_options.chaincode_id,
			chaincode_version: g_options.chaincode_version,
			event_urls: g_options.event_urls,
			endorsed_hook: options.endorsed_hook,
			ordered_hook: options.ordered_hook,
			cc_function: 'ac_benchmark',
			cc_args: [
				options.args.type_,
				options.args.hash_id,
				//options.args.hash
			],
		};
		fcw.invoke_chaincode(enrollObj, opts, function (err, resp) {
			if (cb) {
				if (!resp) resp = {};
				resp.id = opts.cc_args[1];			//pass marble id back
				cb(err, resp);
			}
		});
	};

	marbles_chaincode.create_benchmark = function (options, cb) {
		console.log('');
		logger.info('Creating a benchmark...');

		var opts = {
			peer_urls: g_options.peer_urls,
			peer_tls_opts: g_options.peer_tls_opts,
			channel_id: g_options.channel_id,
			chaincode_id: g_options.chaincode_id,
			chaincode_version: g_options.chaincode_version,
			event_urls: g_options.event_urls,
			endorsed_hook: options.endorsed_hook,
			ordered_hook: options.ordered_hook,
			cc_function: 'benchmarks',
			cc_args: [
				options.args.type_,
				options.args.hash_id,
				//options.args.hash
			],
		};
		fcw.invoke_chaincode(enrollObj, opts, function (err, resp) {
			if (cb) {
				if (!resp) resp = {};
				resp.id = opts.cc_args[1];			//pass marble id back
				cb(err, resp);
			}
		});
	};



	// All ---------------------------------------------------------------------------------

	//read everthing
	marbles_chaincode.read_everything = function (options, cb) {
		console.log('');
		logger.info('Fetching EVERYTHING...');

		var opts = {
			peer_urls: g_options.peer_urls,
			peer_tls_opts: g_options.peer_tls_opts,
			channel_id: g_options.channel_id,
			chaincode_version: g_options.chaincode_version,
			chaincode_id: g_options.chaincode_id,
			cc_function: 'read_everything',
			cc_args: ['']
		};
		fcw.query_chaincode(enrollObj, opts, cb);
	};

	marbles_chaincode.read_account = function (options, cb) {
		console.log('Fetching account...');
		logger.info('Fetching account...');

		var opts = {
			peer_urls: g_options.peer_urls,
			peer_tls_opts: g_options.peer_tls_opts,
			channel_id: g_options.channel_id,
			chaincode_version: g_options.chaincode_version,
			chaincode_id: g_options.chaincode_id,
			cc_function: 'read_account',
			cc_args: ['']
		};
		fcw.query_chaincode(enrollObj, opts, cb);
	};

	marbles_chaincode.read_ac_trade = function (options, cb) {
		console.log('');
		logger.info('Fetching ac trade...');

		var opts = {
			peer_urls: g_options.peer_urls,
			peer_tls_opts: g_options.peer_tls_opts,
			channel_id: g_options.channel_id,
			chaincode_version: g_options.chaincode_version,
			chaincode_id: g_options.chaincode_id,
			cc_function: 'read_ac_trade',
			cc_args: ['']
		};
		fcw.query_chaincode(enrollObj, opts, cb);
	};

	marbles_chaincode.read_ac_benchmark = function (options, cb) {
		console.log('');
		logger.info('Fetching acbenchmark...');

		var opts = {
			peer_urls: g_options.peer_urls,
			peer_tls_opts: g_options.peer_tls_opts,
			channel_id: g_options.channel_id,
			chaincode_version: g_options.chaincode_version,
			chaincode_id: g_options.chaincode_id,
			cc_function: 'read_ac_benchmark',
			cc_args: ['']
		};
		fcw.query_chaincode(enrollObj, opts, cb);
	};

	marbles_chaincode.read_benchmarks = function (options, cb) {
		console.log('');
		logger.info('Fetching benchmark...');

		var opts = {
			peer_urls: g_options.peer_urls,
			peer_tls_opts: g_options.peer_tls_opts,
			channel_id: g_options.channel_id,
			chaincode_version: g_options.chaincode_version,
			chaincode_id: g_options.chaincode_id,
			cc_function: 'read_benchmarks',
			cc_args: ['']
		};
		fcw.query_chaincode(enrollObj, opts, cb);
	};

	// get block height of the channel
	marbles_chaincode.channel_stats = function (options, cb) {
		var opts = {
			peer_urls: g_options.peer_urls,
			peer_tls_opts: g_options.peer_tls_opts
		};
		fcw.query_channel(enrollObj, opts, cb);
	};


	marbles_chaincode.delete_account= function (options, cb) {
		console.log('');
		logger.info('Deleting an account...');

		var opts = {
			peer_urls: g_options.peer_urls,
			peer_tls_opts: g_options.peer_tls_opts,
			channel_id: g_options.channel_id,
			chaincode_id: g_options.chaincode_id,
			chaincode_version: g_options.chaincode_version,
			event_urls: g_options.event_urls,
			endorsed_hook: options.endorsed_hook,
			ordered_hook: options.ordered_hook,
			cc_function: 'delete_account',
			cc_args: [options.args.id,options.args.type_],
		};
		fcw.invoke_chaincode(enrollObj, opts, cb);
	};

	// Other -------------------------------------------------------------------------------

	// random string of x length
	function randStr(length) {
		var text = '';
		var possible = 'abcdefghijkmnpqrstuvwxyz0123456789ABCDEFGHJKMNPQRSTUVWXYZ';
		for (var i = 0; i < length; i++) text += possible.charAt(Math.floor(Math.random() * possible.length));
		return text;
	}

	// left pad string with "0"s
	function leftPad(str, length) {
		for (var i = str.length; i < length; i++) str = '0' + String(str);
		return str;
	}

	return marbles_chaincode;
};

