// ==================================
// Websocket Server Side Code 
// ==================================
//var async = require('async');
var path = require('path');

module.exports = function (g_options, fcw, logger) {
	var helper = require(path.join(__dirname, './helper.js'))(process.env.creds_filename, logger);
	var ws_server = {};
	var broadcast = null;
	var known_everything = {};
	var marbles_lib = null;
	var known_height = 0;
	var checkPeriodically = null;
	var enrollInterval = null;
	var async = require('async');

    var crypto = require('crypto');
	var async2 = require('async');
	//var mysql = require('mysql');
	var http = require('http');
	var sqlite3 = require('sqlite3').verbose();
	var db = new sqlite3.Database('test.db', function(err){
        console.log('--------------------------CONNECT INFORMATION-------------------------------------');
        if(err){
            console.error("database connection failed:" + err.stack);
            return;
        }
        console.log("database connection success!!!");
        console.log('---------------------------------------------------------------------------------\n\n');
    });
    

    console.log("database connection success!!!!");
    console.log('---------------------------------------------------------------------------------\n\n');
	var jsSHA=require('jssha');
	//--------------------------------------------------------
	// Setup WS Module
	//--------------------------------------------------------
	ws_server.setup = function (l_broadcast, l_marbles_lib) {
		broadcast = l_broadcast;
		marbles_lib = l_marbles_lib;
        
		// --- Keep Alive  --- //
		clearInterval(enrollInterval);
		enrollInterval = setInterval(function () {					//to avoid REQUEST_TIMEOUT errors we periodically re-enroll
			let enroll_options = helper.makeEnrollmentOptions(0);
			fcw.enroll(enroll_options, function (err, enrollObj2) {
				if (err == null) {
					//marbles_lib = require(path.join(__dirname, './marbles_cc_lib.js'))(enrollObj2, opts, fcw, logger);
				}
			});														//this seems to be safe 3/27/2017
		}, helper.getKeepAliveMs());								//timeout happens at 5 minutes, so this interval should be faster than that
	};

	// process web socket messages
	ws_server.process_msg = function (ws, data) {
		const channel = helper.getChannelId();
		const first_peer = helper.getFirstPeerName(channel);
		var options = {
			peer_urls: [helper.getPeersUrl(first_peer)],
			ws: ws,
			endorsed_hook: endorse_hook,
			ordered_hook: orderer_hook
		};
		if (marbles_lib === null) {
			logger.error('marbles lib is null...');				//can't run in this state
			return;
		}
        
		// get all accounts
		else if (data.type === 'read_everything') {
			logger.info('[ws] read everything req');
			ws_server.check_for_updates(ws);
		}

		// create new account 
		else if(data.type == 'create_account'){
        	console.log('----------------------------------Create Account!--------------------------------------');
        	var value=data.ac_id+data.ac_short_name+data.ac_status+data.term_date+data.inception_date+data.ac_region+data.ac_sub_region+data.cod_country_domicile+data.liq_method+data.contracting_entity+data.mgn_entity+data.ac_legal_name+data.manager_name+data.cod_ccy_base+data.long_name+data.mandate_id+data.client_id+data.custodian_name+data.sub_mandate_id+data.transfer_agent_name+data.trust_bank+data.re_trust_bank+data.last_updated_by+data.last_approved_by+data.last_update_date;
        	console.log("------FROM PAGE----");
       		var sha=new jsSHA("SHA-256","TEXT");
        	sha.update(value);
        	var sha_value=sha.getHash("HEX");
        	console.log("SHA-VALUE: " + sha_value);
            var md5 = crypto.createHash('md5');
            md5.update(value);
            var sha_id = md5.digest('hex');
            console.log("SHA-ID: " + sha_id);
        	options.args = {
					type_: 'account',
                    hash_id: sha_id,
					//hash: sha_value
			};
    
            marbles_lib.create_account(options, function (err, resp) {
                if (err != null) {
                    send_err(err, resp);
                }
                else{
                    ws_server.check_for_updates(ws);
                    options.ws.send(JSON.stringify({ msg: 'tx_step', state: 'finished' }));
                    console.log("ok");
                    
                    db.serialize(function () {
            			db.run('INSERT INTO account(sha_value, ac_id,ac_short_name,status,term_date,inception_date,ac_region,' +
                			'ac_sub_region,cod_country_domicile,liq_method,contracting_entity,mgn_entity,ac_legal_name,manager_name,' +
                			'cod_ccy_base,longname,mandate_id,client_id,custodian_name,sub_mandate_id,transfer_agent_name,trust_bank,' +
                			're_trust_bank,last_updated_by,last_approved_by,last_update_date) ' +
                			'VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
                			[sha_id, data.ac_id, data.ac_short_name, data.ac_status, data.term_date,
                    		data.inception_date, data.ac_region, data.ac_sub_region, data.cod_country_domicile, data.liq_method,
                    		data.contracting_entity, data.mgn_entity, data.ac_legal_name, data.manager_name, data.cod_ccy_base,
                    		data.long_name, data.mandate_id, data.client_id, data.custodian_name, data.sub_mandate_id,
                    		data.transfer_agent_name, data.trust_bank, data.re_trust_bank, data.last_updated_by,
                    		data.last_approved_by, data.last_update_date],

                			function(err){
                    			if(err){
                        			console.log('--------------------------FAIL INSERT Account----------------------------');
                        			console.log('[INSERT ERROR] - ',err.stack);
                        			console.log('--------------------------------------------------------------------\n\n');
                    			}else{
                        			console.log('--------------------------SUCCESS INSERT Account----------------------------');
                        			console.log('Last Inserted Row ID: ' + this.lastID);
                        			console.log('Number of Rows Affected: ' + this.changes);
                        			console.log('--------------------------------------------------------------------\n\n');
                    			}
                			});
        			});
                    sendMsg({msg: 'new_account', sha_value:sha_id, ac_id:data.ac_id, ac_short_name:data.ac_short_name, status:data.status, term_date:data.term_date,
                            inception_date:data.inception_date, ac_region: data.ac_region, ac_sub_region:data.ac_sub_region, cod_country_domicile:data.cod_country_domicile, liq_method:data.liq_method,
                            contracting_entity:data.contracting_entity, mgn_entity:data.mgn_entity, ac_legal_name:data.ac_legal_name, manager_name:data.manager_name, cod_ccy_base:data.cod_ccy_base,
                            long_name:data.longname, mandate_id:data.mandate_id, client_id:data.client_id, custodian_name:data.custodian_name, sub_mandate_id:data.sub_mandate_id,
                            transfer_agent_name:data.transfer_agent_name, trust_bank:data.trust_bank, re_trust_bank:data.re_trust_bank, last_updated_by:data.last_updated_by,
                            last_approved_by:data.last_approved_by, last_update_date:data.last_update_date});
                } 
            });
    	}

    	// create new ac_trade
    	else if(data.type == 'ac_trade_setup'){
       		console.log('----------------------------------Create ac_trade!--------------------------------------');
        	var value=data.ac_id+data.lvts+data.calypso+data.aladdin+data.trade_start_date+data.equity+data.fixed_income;
       		console.log("------FROM PAGE----"+value);
        	var sha=new jsSHA("SHA-256","TEXT");
        	sha.update(value);
        	var sha_value=sha.getHash("HEX");
        	console.log("SHA-VALUE: " + sha_value);
            var md5 = crypto.createHash('md5');
            md5.update(value);
            var sha_id = md5.digest('hex');

        	options.args = {
					type_: 'ac_trade',
                    hash_id: sha_id,
					//hash: sha_value
			};

			marbles_lib.create_ac_trade(options, function (err, resp) {
				if (err != null) send_err(err, resp);
				else{
                    
					ws_server.check_for_updates(ws);
					options.ws.send(JSON.stringify({ msg: 'tx_step', state: 'finished' }));
					db.serialize(function () {
            			db.run('INSERT INTO ac_trade(sha_value,ac_id,lvts,calypso,aladdin,trade_start_date,equity,fixed_income) ' +
								'VALUES(?,?,?,?,?,?,?,?)',[ sha_id, data.ac_id, data.lvts, data.calypso,
                    			data.aladdin, data.trade_start_date, data.equity, data.fixed_income],

                		function(err){
                    		if(err){
                        		console.log('--------------------------FAIL INSERT Account----------------------------');
                        		console.log('[INSERT ERROR] - ',err.stack);
                        		console.log('--------------------------------------------------------------------\n\n');
                    		}else{
                        		console.log('--------------------------SUCCESS INSERT Account----------------------------');
                        		console.log('Last Inserted Row ID: ' + this.lastID);
                        		console.log('Number of Rows Affected: ' + this.changes);
                        		console.log('--------------------------------------------------------------------\n\n');
                   			}
                		});
        			});
                    sendMsg({msg: 'new_ac_trade', sha_value:sha_id, ac_id:data.ac_id, lvts:data.lvts, calypso:data.calypso,
                            aladdin:data.aladdin, trade_start_date:data.trade_start_date, equity:data.equity, fixed_income:data.fixed_income});
				}			
			});
    	}

    	// crteate new ac_benchmark
    	else if(data.type == 'ac_benchmark'){
        	console.log('----------------------------------Create ac_benchmark!--------------------------------------');
        	var value=data.ac_id+data.benchmark_id+data.source+data.name+data.currency+data.primary_flag+data.start_date+data.end_date+data.benchmark_reference_id+data.benchmark_reference_id_source;
        	console.log("------FROM PAGE----"+value);
        	var sha=new jsSHA("SHA-256","TEXT");
        	sha.update(value);
        	var sha_value=sha.getHash("HEX");
        	console.log("SHA-VALUE: " + sha_value);
            var md5 = crypto.createHash('md5');
            md5.update(value);
            var sha_id = md5.digest('hex');

        	options.args = {
					type_: 'ac_benchmark',
                    hash_id: sha_id,
					//hash: sha_value
			};

			marbles_lib.create_ac_benchmark(options, function (err, resp) {
				if (err != null) send_err(err, resp);
				else{
					ws_server.check_for_updates(ws);
					options.ws.send(JSON.stringify({ msg: 'tx_step', state: 'finished' }));
					db.serialize(function () {
            			db.run('INSERT INTO ac_benchmark( sha_value,ac_id,benchmark_id,source,name,currency,primary_flag,' +
                			'start_date,end_date,benchmark_reference_id,benchmark_reference_id_source) VALUES(?,?,?,?,?,?,?,?,?,?,?)',
                			[sha_id, data.ac_id, data.benchmark_id, data.source, data.name,
                    		data.currency, data.primary_flag, data.start_date, data.end_date, data.benchmark_reference_id,
                    		data.benchmark_reference_id_source],
                		function(err){
                    		if(err){
                        		console.log('--------------------------FAIL INSERT Account----------------------------');
                        		console.log('[INSERT ERROR] - ',err.stack);
                        		console.log('--------------------------------------------------------------------\n\n');
                    		}else{
                       			console.log('--------------------------SUCCESS INSERT Account----------------------------');
                        		console.log('Last Inserted Row ID: ' + this.lastID);
                        		console.log('Number of Rows Affected: ' + this.changes);
                        		console.log('--------------------------------------------------------------------\n\n');
                    		}
                		});
        			});
				} 			
			});	
            sendMsg({msg: 'new_ac_benchmark', sha_value:sha_id, ac_id:data.ac_id, benchmark_id:data.benchmark_id, source:data.source, name:data.name, currency:data.currency,
                            primary_flag:data.primary_flag, start_date:data.start_date, end_date:data.end_date, benchmark_reference_id:data.benchmark_reference_id, benchmark_reference_id_source:data.benchmark_reference_id_source});
    	}

    	//create new benchmarkss
    	else if(data.type == 'benchmarks'){
        	console.log('----------------------------------Create benchmarks!--------------------------------------');
        	var value=data.benchmark_id+data.id_source+data.name+data.currency+data.benchmark_reference_id+data.benchmark_reference_id_source;
        	console.log("------FROM PAGE-------");
        	var sha=new jsSHA("SHA-256","TEXT");
        	sha.update(value);
        	var sha_value=sha.getHash("HEX");
        	console.log("SHA-VALUE: " + sha_value);
            var md5 = crypto.createHash('md5');
            md5.update(value);
            var sha_id = md5.digest('hex');

        	options.args = {
					type_: 'benchmarks',
                    hash_id: sha_id,
			};
			marbles_lib.create_benchmark(options, function (err, resp) {
				if (err != null) send_err(err, resp);
				else{
					ws_server.check_for_updates(ws);	
					options.ws.send(JSON.stringify({ msg: 'tx_step', state: 'finished' }));
					db.serialize(function () {
            			db.run('INSERT INTO benchmarks(sha_value,benchmark_id,id_source,name,currency,benchmark_reference_id,' +
                			'benchmark_reference_id_source) VALUES(?,?,?,?,?,?,?)',
                			[ sha_id, data.benchmark_id, data.id_source, data.name, data.currency,
                    		data.benchmark_reference_id, data.benchmark_reference_id_source],
                		function(err){
                    		if(err){
                        		console.log('--------------------------FAIL INSERT Account----------------------------');
                        		console.log('[INSERT ERROR] - ',err.stack);
                        		console.log('--------------------------------------------------------------------\n\n');
                    		}else{
                        		console.log('--------------------------SUCCESS INSERT Account----------------------------');
                        		console.log('Last Inserted Row ID: ' + this.lastID);
                        		console.log('Number of Rows Affected: ' + this.changes);
                        		console.log('--------------------------------------------------------------------\n\n');
                    		}
                		});
        			});			
				} 
			});       	
           sendMsg({msg: 'new_benchmark', sha_value:sha_id, benchmark_id:data.benchmark_id, id_source:data.id_source, name:data.name, currency:data.currency,
                            benchmark_reference_id:data.benchmark_reference_id, benchmark_reference_id_source:data.benchmark_reference_id_source});
   		}

   		else if (data.type == 'data_view') {
        	console.log('view data');
        	if (data.data_type == 'account'){
            	var selectSQL = 'select * from `account` where flag = 1 or flag = 2';
                db.serialize(function(){
                // Database#each(sql, [param, ...], [callback], [complete])
                    // var selectSQL = 'select * from `account` where flag = 0';
                    db.each(selectSQL, function(err,row){
                        if(err){
                            console.log('--------------------------FAIL SELECT Account----------------------------');
                            console.log('[SELECT ERROR] - ',err.stack);
                            console.log('--------------------------------------------------------------------\n\n');
                            throw err;
                        }
                        //console.log(row);
                        sendMsg({
                            msg: 'account',sha_value: row.sha_value,ac_id: row.ac_id,ac_short_name: row.ac_short_name,status: row.status,term_date: row.term_date,
                            inception_date: row.inception_date,ac_region: row.ac_region,ac_sub_region: row.ac_sub_region,cod_country_domicile: row.cod_country_domicile,liq_method: row.liq_method,
                            contracting_entity: row.contracting_entity,mgn_entity: row.mgn_entity,ac_legal_name: row.ac_legal_name,manager_name: row.manager_name,cod_ccy_base: row.cod_ccy_base,long_name: row.longname,mandate_id: row.mandate_id,
                            client_id: row.client_id,custodian_name: row.custodian_name, sub_mandate_id: row.sub_mandate_id,transfer_agent_name: row.transfer_agent_name,
                            trust_bank: row.trust_bank,re_trust_bank: row.re_trust_bank,last_updated_by: row.last_updated_by,last_approved_by: row.last_approved_by,last_update_date: row.last_update_date
                        });
                    })
                });
        	}

        	else if (data.data_type == 'ac_trade') {
                var selectSQL = 'select * from `ac_trade` where flag = 1 or flag = 2';
                db.serialize(function(){
                    // Database#each(sql, [param, ...], [callback], [complete])
                    db.each(selectSQL, function(err,row){
                        if(err){
                            console.log('--------------------------FAIL SELECT Account_Trade----------------------------');
                            console.log('[SELECT ERROR] - ',err.stack);
                            console.log('--------------------------------------------------------------------\n\n');
                            throw err;
                        }
                        //console.log(row);
                        sendMsg({msg: 'ac_trade', sha_value:row.sha_value, ac_id:row.ac_id, lvts:row.lvts, calypso:row.calypso,
                            aladdin:row.aladdin, trade_start_date:row.trade_start_date, equity:row.equity, fixed_income:row.fixed_income});
                    })
                });
        	}

        	else if (data.data_type == 'ac_benchmark') {
            	var selectSQL = 'select * from `ac_benchmark` where flag = 1 or flag = 2';
                db.serialize(function(){
                    // Database#each(sql, [param, ...], [callback], [complete])
                    db.each(selectSQL, function(err,row){
                        if(err){
                            console.log('--------------------------FAIL SELECT Account_Benchmark----------------------------');
                            console.log('[SELECT ERROR] - ',err.stack);
                            console.log('--------------------------------------------------------------------\n\n');
                            throw err;
                        }
                        //console.log(row);
                        sendMsg({msg: 'ac_benchmark', sha_value:row.sha_value, ac_id:row.ac_id, benchmark_id:row.benchmark_id, source:row.source, name:row.name, currency:row.currency,
                            primary_flag:row.primary_flag, start_date:row.start_date, end_date:row.end_date, benchmark_reference_id:row.benchmark_reference_id, benchmark_reference_id_source:row.benchmark_reference_id_source});
                    })
                });
        	}

        	else if (data.data_type == 'benchmarks') {
                var selectSQL = 'select * from `benchmarks` where flag = 1';
                db.serialize(function(){
                    // Database#each(sql, [param, ...], [callback], [complete])
                    db.each(selectSQL, function(err,row){
                        if(err){
                            console.log('--------------------------FAIL SELECT Benchmarks----------------------------');
                            console.log('[SELECT ERROR] - ',err.stack);
                            console.log('--------------------------------------------------------------------\n\n');
                            throw err;
                        }
                        //console.log(row);
                        sendMsg({msg: 'benchmarks', sha_value:row.sha_value, benchmark_id:row.benchmark_id, id_source:row.id_source, name:row.name, currency:row.currency,
                            benchmark_reference_id:row.benchmark_reference_id, benchmark_reference_id_source:row.benchmark_reference_id_source});
                    })
                });
        	}
    	}

    	else if (data.type == 'untreated') {				// recheck first
        	console.log('--------------get untreated account now--------------------------');
        	if (data.table_name == 'account'){
            	console.log('----------------------------recheck account first-------------------------------');
            	// var chain_account;
            	// chain_account = read_account();

            	recheck_account(db);

            	
            	// get untreated record
            	var selectSQL = 'select * from `account` where flag = 0';
            	db.serialize(function(){
                // Database#each(sql, [param, ...], [callback], [complete])
                	// var selectSQL = 'select * from `account` where flag = 0';
                	db.each(selectSQL, function(err,row){
                    	if(err){
                        	console.log('--------------------------FAIL SELECT Account----------------------------');
                        	console.log('[SELECT ERROR] - ',err.stack);
                        	console.log('--------------------------------------------------------------------\n\n');
                        	throw err;
                    	}
                    	//console.log(row);
                    	sendMsg({
                        	msg: 'untreated_account',sha_value: row.sha_value,ac_id: row.ac_id,ac_short_name: row.ac_short_name,
                        	status: row.status,term_date: row.term_date,inception_date: row.inception_date,ac_region: row.ac_region,
                        	ac_sub_region: row.ac_sub_region,cod_country_domicile: row.cod_country_domicile,liq_method: row.liq_method,
                        	contracting_entity: row.contracting_entity,mgn_entity: row.mgn_entity,ac_legal_name: row.ac_legal_name,manager_name: row.manager_name,
                        	cod_ccy_base: row.cod_ccy_base,long_name: row.longname,mandate_id: row.mandate_id,client_id: row.client_id,
                        	custodian_name: row.custodian_name,sub_mandate_id: row.sub_mandate_id,transfer_agent_name: row.transfer_agent_name,
                        	trust_bank: row.trust_bank,re_trust_bank: row.re_trust_bank,last_updated_by: row.last_updated_by,
                        	last_approved_by: row.last_approved_by,last_update_date: row.last_update_date
                    	});
                	})
            	});
        	}

        	else if (data.table_name == 'ac_trade') {
            	console.log('----------------------------recheck account trade first-------------------------------');
            	read_ac_trade();
            	var selectSQL = 'select * from `ac_trade` where flag = 0';
            	db.serialize(function(){
                	// Database#each(sql, [param, ...], [callback], [complete])
                	db.each(selectSQL, function(err,row){
                    	if(err){
                        	console.log('--------------------------FAIL SELECT Account_Trade----------------------------');
                        	console.log('[SELECT ERROR] - ',err.stack);
                        	console.log('--------------------------------------------------------------------\n\n');
                        	throw err;
                    	}
                    	//console.log(row);
                    	sendMsg({msg: 'untreated_ac_trade', sha_value:row.sha_value, ac_id:row.ac_id, lvts:row.lvts, calypso:row.calypso,
                        	aladdin:row.aladdin, trade_start_date:row.trade_start_date, equity:row.equity, fixed_income:row.fixed_income});
                	})
            	});
        	}

        	else if (data.table_name == 'ac_benchmark'){
            	console.log('----------------------------recheck account benchmark first-------------------------------');
            	read_ac_benchmark();
            	var selectSQL = 'select * from `ac_benchmark` where flag = 0';
            	db.serialize(function(){
                	// Database#each(sql, [param, ...], [callback], [complete])
                	db.each(selectSQL, function(err,row){
                    	if(err){
                        	console.log('--------------------------FAIL SELECT Account_Benchmark----------------------------');
                        	console.log('[SELECT ERROR] - ',err.stack);
                        	console.log('--------------------------------------------------------------------\n\n');
                        	throw err;
                    	}
                    	//console.log(row);
                    	sendMsg({msg: 'untreated_ac_benchmark', sha_value:row.sha_value, ac_id:row.ac_id, benchmark_id:row.benchmark_id, source:row.source, name:row.name, currency:row.currency,
                        	primary_flag:row.primary_flag, start_date:row.start_date, end_date:row.end_date, benchmark_reference_id:row.benchmark_reference_id, benchmark_reference_id_source:row.benchmark_reference_id_source});
                	})
            	});
        	}

        	else if (data.table_name == 'benchmarks'){
            	console.log('----------------------------recheck benchmarks first-------------------------------');
            	read_benchmarks();
            	var selectSQL = 'select * from `benchmarks` where flag = 0';
            	db.serialize(function(){
               		// Database#each(sql, [param, ...], [callback], [complete])
                	db.each(selectSQL, function(err,row){
                    	if(err){
                        	console.log('--------------------------FAIL SELECT Benchmarks----------------------------');
                        	console.log('[SELECT ERROR] - ',err.stack);
                        	console.log('--------------------------------------------------------------------\n\n');
                        	throw err;
                    	}
                    	//console.log(row);
                    	sendMsg({msg: 'untreated_benchmarks', sha_value:row.sha_value, benchmark_id:row.benchmark_id, id_source:row.id_source, name:row.name, currency:row.currency,
                        	benchmark_reference_id:row.benchmark_reference_id, benchmark_reference_id_source:row.benchmark_reference_id_source});
                	})
            	});
        	}
    	}

    	else if (data.type == 'new') {
        	console.log('-----------------get new accepted account now---------------------');
        	if(data.table_name == 'account') {
            	var selectSQL = 'select * from `account` where flag = 1';
            	db.serialize(function(){
                	// Database#each(sql, [param, ...], [callback], [complete])
                	db.each(selectSQL, function(err,row){
                    	if(err){
                        	console.log('--------------------------FAIL SELECT New_Accepted_Account----------------------------');
                        	console.log('[SELECT ERROR] - ',err.stack);
                        	console.log('--------------------------------------------------------------------\n\n');
                        	throw err;
                    	}
                    	console.log(row);
                    	sendMsg({msg: 'newAccepted_account', sha_value:row.sha_value, ac_id:row.ac_id, ac_short_name:row.ac_short_name, status:row.status, term_date:row.term_date,
                        	inception_date:row.inception_date, ac_region: row.ac_region, ac_sub_region:row.ac_sub_region, cod_country_domicile:row.cod_country_domicile, liq_method:row.liq_method,
                        	contracting_entity:row.contracting_entity, mgn_entity:row.mgn_entity, ac_legal_name:row.ac_legal_name, manager_name:row.manager_name, cod_ccy_base:row.cod_ccy_base,
                        	long_name:row.longname, mandate_id:row.mandate_id, client_id:row.client_id, custodian_name:row.custodian_name, sub_mandate_id:row.sub_mandate_id,
                        	transfer_agent_name:row.transfer_agent_name, trust_bank:row.trust_bank, re_trust_bank:row.re_trust_bank, last_updated_by:row.last_updated_by,
                        	last_approved_by:row.last_approved_by, last_update_date:row.last_update_date});
                	})
            	});
        	}

        	else if (data.table_name == 'ac_trade'){
            	var selectSQL = 'select * from `ac_trade` where flag = 1';
            	db.serialize(function(){
                	// Database#each(sql, [param, ...], [callback], [complete])
                	db.each(selectSQL, function(err,row){
                    	if(err){
                        	console.log('--------------------------FAIL SELECT New_Accepted_Account_Trade----------------------------');
                        	console.log('[SELECT ERROR] - ',err.stack);
                        	console.log('--------------------------------------------------------------------\n\n');
                        	throw err;
                    	}
                    	console.log(row);
                    	sendMsg({msg: 'newAccepted_actrade', sha_value:row.sha_value, ac_id:row.ac_id, lvts:row.lvts, calypso:row.calypso,
                        	aladdin:row.aladdin, trade_start_date:row.trade_start_date, equity:row.equity, fixed_income:row.fixed_income});
                	})
            	});
        	}

        	else if (data.table_name == 'ac_benchmark'){
            	var selectSQL = 'select * from `ac_benchmark` where flag = 1';
            	db.serialize(function(){
                	// Database#each(sql, [param, ...], [callback], [complete])
                	db.each(selectSQL, function(err,row){
                    	if(err){
                        	console.log('--------------------------FAIL SELECT New_Accepted_ACBEN----------------------------');
                        	console.log('[SELECT ERROR] - ',err.stack);
                        	console.log('--------------------------------------------------------------------\n\n');
                        	throw err;
                    	}
                    	console.log(row);
                    	sendMsg({msg: 'newAccepted_acben', sha_value:row.sha_value, ac_id:row.ac_id, benchmark_id:row.benchmark_id, source:row.source, name:row.name, currency:row.currency,
                        	primary_flag:row.primary_flag, start_date:row.start_date, end_date:row.end_date, benchmark_reference_id:row.benchmark_reference_id, benchmark_reference_id_source:row.benchmark_reference_id_source});
                	})
            	});
        	}
    	}
   		else if (data.type == 'know_new_record') {
        	console.log('-----------------know new record----------------------');
        	console.log(data.id);
        	if (data.table_name == 'account') {
            	var updateSQL = 'update account set flag = 2 where ac_id = ' + '"' + data.id + '"';
            	db.serialize(function(){
                	db.run(updateSQL, function(err){
                    	if(err){
                        	console.log(err);
                        	throw err;
                    	}
                    	console.log("UPDATE Return ==> ");
                    	console.log('Number of Rows Affected: ' + this.changes);
                	})
            	});
        	}

        	else if (data.table_name == 'ac_trade'){
            	var updateSQL = 'update ac_trade set flag = 2 where ac_id = ' + '"' +data.id + '"';
            	db.serialize(function(){
                	db.run(updateSQL, function(err){
                    	if(err){
                        	console.log(err);
                        	throw err;
                    	}
                    	console.log("UPDATE Return ==> ");
                    	console.log('Number of Rows Affected: ' + this.changes);
                	})
            	});
        	}

        	else if (data.table_name == 'ac_benchmark'){
            	var updateSQL = 'update ac_benchmark set flag = 2 where ac_id = ' + '"' +data.id + '"';
            	db.serialize(function(){
                	db.run(updateSQL, function(err){
                    	if(err){
                        	console.log(err);
                        	throw err;
                    	}
                    	console.log("UPDATE Return ==> ");
                    	console.log('Number of Rows Affected: ' + this.changes);
                	})
            	});
        	}
    	}

    	else if(data.type == 'ac_accept') {
        	console.log('------------------------------accept the account now---------------------------------');
        	console.log(data.ac_id);		// success
        	var updateSQL = 'update account set flag = 1 where ac_id = ' + '"' + data.ac_id + '"';
        	db.serialize(function(){
            	db.run(updateSQL, function(err){
                	if(err){
                    	console.log(err);
                    	throw err;
                	}
                	console.log("UPDATE Return ==> ");
                	console.log('Number of Rows Affected: ' + this.changes);
            	})
        	});
    	}

    	else if (data.type == 'actra_accept') {
        	console.log('------------------------------accept the account trade now---------------------------------');
        	console.log(data.ac_id);
        	var updateSQL = 'update ac_trade set flag = 1 where ac_id = ' +  '"' + data.ac_id + '"';
        	db.serialize(function(){
            	db.run(updateSQL, function(err){
                	if(err){
                    	console.log(err);
                    	throw err;
                	}
                	console.log("UPDATE Return ==> ");
                	console.log('Number of Rows Affected: ' + this.changes);
            	})
        	});
    	}

    	else if(data.type == 'acben_accept') {
        	console.log('------------------------------accept the account benchmark now---------------------------------');
        	console.log(data.ac_id);
        	var updateSQL = 'update ac_benchmark set flag = 1 where ac_id = ' + '"' + data.ac_id + '"';
        	db.serialize(function(){
            	db.run(updateSQL, function(err){
                	if(err){
                    	console.log(err);
                    	throw err;
                	}
                	console.log("UPDATE Return ==> ");
                	console.log('Number of Rows Affected: ' + this.changes);
            	})
        	});
    	}

    	else if(data.type == 'bench_accept') {
        	console.log('------------------------------accept the benchmarks now---------------------------------');
        	console.log(data.id);
        	var updateSQL = 'update benchmarks set flag = 1 where benchmark_id = ' + '"' + data.id + '"';
        	db.serialize(function(){
            	db.run(updateSQL, function(err){
                	if(err){
                    	console.log(err);
                    	throw err;
                	}
                	console.log("UPDATE Return ==> ");
                	console.log('Number of Rows Affected: ' + this.changes);
            	})
        	});
    	}

    	else if(data.type == 'ac_decline') {
        	console.log('---------------------------decline the account now--------------------------------');
        	console.log(data.ac_id);

            var selectSQL = 'select sha_value from `account` where ac_id = '+ '"' + data.ac_id + '"';;
            db.serialize(function(){
                db.each(selectSQL, function(err,row){
                        if(err){
                            console.log('--------------------------FAIL SELECT Account----------------------------');
                            console.log('[SELECT ERROR] - ',err.stack);
                            console.log('--------------------------------------------------------------------\n\n');
                            throw err;
                        }
                        var updateSQL = 'update account set flag = -1 where ac_id = ' + '"' + data.ac_id + '"';
                        options.args = {
                            id: row.sha_value,
                            type_:'account'
                        };

                        marbles_lib.delete_account(options, function (err, resp) {
                            if (err != null) send_err(err, data);
                            else{
                                db.serialize(function(){
                                    db.run(updateSQL, function(err){
                                        if(err){
                                            console.log(err);
                                            throw err;
                                        }
                                        console.log("UPDATE Return ==> ");
                                        console.log('Number of Rows Affected: ' + this.changes);
                                    })
                                });
                                options.ws.send(JSON.stringify({ msg: 'tx_step', state: 'finished' }));
                            } 
                        });
                })
            });
    	}

    	else if(data.type == 'actra_decline') {
        	console.log('---------------------------decline the account trade now--------------------------------');
        	console.log(data.ac_id);
            var selectSQL = 'select sha_value from `ac_trade` where ac_id = '+ '"' + data.ac_id + '"';;
            db.serialize(function(){
                    db.each(selectSQL, function(err,row){
                        if(err){
                            console.log('--------------------------FAIL SELECT Account----------------------------');
                            console.log('[SELECT ERROR] - ',err.stack);
                            console.log('--------------------------------------------------------------------\n\n');
                            throw err;
                        }
                        console.log(row.sha_value);
                        var updateSQL = 'update ac_trade set flag = -1 where ac_id = ' + '"' + data.ac_id + '"';
                        options.args = {
                            id: row.sha_value,
                            type_:'ac_trade'
                        };

                        marbles_lib.delete_account(options, function (err, resp) {
                            if (err != null) send_err(err, data);
                            else{
                                db.serialize(function(){
                                    db.run(updateSQL, function(err){
                                        if(err){
                                            console.log(err);
                                            throw err;
                                        }
                                        console.log("UPDATE Return ==> ");
                                        console.log('Number of Rows Affected: ' + this.changes);
                                    })
                                });
                                options.ws.send(JSON.stringify({ msg: 'tx_step', state: 'finished' }));
                            } 
                        });
                })
            });
    	}

    	else if (data.type == 'acben_decline') {
        	console.log('---------------------------decline the account benchmark now--------------------------------');
        	console.log(data.ac_id);
            var selectSQL = 'select sha_value from `ac_benchmark` where ac_id = '+ '"' + data.ac_id + '"';;
            db.serialize(function(){
                // Database#each(sql, [param, ...], [callback], [complete])
                    // var selectSQL = 'select * from `account` where flag = 0';
                    db.each(selectSQL, function(err,row){
                        if(err){
                            console.log('--------------------------FAIL SELECT Account----------------------------');
                            console.log('[SELECT ERROR] - ',err.stack);
                            console.log('--------------------------------------------------------------------\n\n');
                            throw err;
                        }
                        var updateSQL = 'update ac_benchmark set flag = -1 where ac_id = ' + '"' + data.ac_id + '"';
                        options.args = {
                            id: row.sha_value,
                            type_:'ac_benchmark'
                        };
                        marbles_lib.delete_account(options, function (err, resp) {
                            if (err != null) send_err(err, data);
                            else{
                                db.serialize(function(){
                                    db.run(updateSQL, function(err){
                                        if(err){
                                            console.log(err);
                                            throw err;
                                        }
                                        console.log("UPDATE Return ==> ");
                                        console.log('Number of Rows Affected: ' + this.changes);
                                    })
                                });
                                options.ws.send(JSON.stringify({ msg: 'tx_step', state: 'finished' }));
                            } 
                        });
                })
            });
    	}

    	else if (data.type == 'bench_decline') {
        	console.log('---------------------------decline the benchmarks now--------------------------------');
        	console.log(data.id);
            var selectSQL = 'select sha_value from `benchmarks` where benchmark_id = '+ '"' + data.id + '"';;
            db.serialize(function(){
                    db.each(selectSQL, function(err,row){
                        if(err){
                            console.log('--------------------------FAIL SELECT Account----------------------------');
                            console.log('[SELECT ERROR] - ',err.stack);
                            console.log('--------------------------------------------------------------------\n\n');
                            throw err;
                        }
                        console.log(row.sha_value);
                        var updateSQL = 'update benchmarks set flag = -1 where benchmark_id = ' + '"' +data.id + '"';
                        options.args = {
                            id: row.sha_value,
                            type_:'benchmarks'
                        };

                        marbles_lib.delete_account(options, function (err, resp) {
                            if (err != null) send_err(err, data);
                            else{
                                db.serialize(function(){
                                    db.run(updateSQL, function(err){
                                        if(err){
                                            console.log(err);
                                            throw err;
                                        }
                                        console.log("UPDATE Return ==> ");
                                        console.log('Number of Rows Affected: ' + this.changes);
                                    })
                                });
                                options.ws.send(JSON.stringify({ msg: 'tx_step', state: 'finished' }));
                            } 
                        });
                })
            });
    	}

    	// else if(data.type == 'recheck'){
     //    	console.log("------[recheck now]-------");
     //    	var chain_hash = data.chain_hash;
     //    	var table = data.table_name;
     //    	console.log(data.chain_hash.length);
     //    	console.log("--------[someone recheck the "+table+" now------]");
     //    	async.eachLimit(chain_hash, 1, function (hash, cb) {
     //        	var selectSQL = 'SELECT * FROM '+ table +' WHERE `sha_value` = \'' + hash+'\'';
     //        	console.log(selectSQL);
     //        	db.serialize(function(){
     //            	// Database#each(sql, [param, ...], [callback], [complete])
     //            	db.each(selectSQL, function(err,row){
     //                	if(err){throw err;}
     //                	console.log(row);
     //               		var value = "";
     //                	if( table == 'account' ) {
     //                    	value = row.ac_id + row.ac_short_name + row.status + row.term_date + row.inception_date + row.ac_region
     //                        	+ row.ac_sub_region + row.cod_country_domicile + row.liq_method + row.contracting_entity + row.mgn_entity
     //                        	+ row.ac_legal_name + row.manager_name + row.cod_ccy_base + row.longname + row.mandate_id + row.client_id
     //                        	+ row.custodian_name + row.sub_mandate_id + row.transfer_agent_name + row.trust_bank + row.re_trust_bank
     //                        	+ row.last_updated_by + row.last_approved_by + row.last_update_date;
     //                    	console.log("-----[从数据库取出来的]-----"+value);
     //                	}
     //                	else if (table == 'ac_trade') {
     //                    	value = row.ac_id + row.lvts + row.calypso + row.aladdin + row.trade_start_date + row.equity + row.fixed_income;
     //                    	console.log("-----[从数据库取出来的]-----"+value);
     //                	}
     //                	else if(table == 'ac_benchmark') {
     //                    	value = row.ac_id + row.benchmark_id + row.source + row.name + row.currency + row.primary_flag + row.start_date
     //                        	+ row.end_date + row.benchmark_reference_id + row.benchmark_reference_id_source;
     //                    	console.log("-----[从数据库取出来的]-----"+value);
     //                	}
     //                	else if(table == 'benchmarks') {
     //                    	value = row.benchmark_id + row.id_source + row.name + row.currency + row.benchmark_reference_id +
     //                        	row.benchmark_reference_id_source;
     //                        console.log("-----[从数据库取出来的]-----"+value);
     //                	}
     //                	else{
     //                    	console.log("----[Table `" + table + "` does not exist!]-----");
     //                	}
     //                	var sha = new jsSHA("SHA-256", "TEXT");
     //                	sha.update(value);
     //                	var sha_value = sha.getHash("HEX");		// new hash
     //                	console.log("SHA-VALUE: "+sha_value);
     //                	if (sha_value !== hash) {			// data change
     //                    	console.log("[HASH IN INDEXING] "+hash);
     //                    	console.log("[HASH IN ACCOUNT] "+ sha_value);
     //                    	sendMsg({msg: 'validity', table_name: table, sha_value: hash});
     //                    	console.log("SHA-VALUE: " + sha_value);
     //                	}
     //                	else {
     //                    	console.log("MATCH! NO PROBLEM!");
     //                	}
     //            	}, function(err, number){
     //                	if(number==0){// can not find the hash value from the table
     //                    	console.log('---fail---CAN NOT FOUND HASH in table '+table);
     //                    	sendMsg({
     //                        	msg: 'validity',
     //                        	table_name: 'unknown',
     //                        	show_location: table,
     //                        	sha_value: hash
     //                    	});
     //                	}
     //            	})
     //        	});
     //        	cb(null);
     //    	}, function (err) {
     //        	if (err) {
     //            	console.error("error");
     //        	}
     //    	});
    	// }

		// send transaction error msg 
		function send_err(msg, input) {
			sendMsg({ msg: 'tx_error', e: msg, input: input });
			sendMsg({ msg: 'tx_step', state: 'committing_failed' });
		}

		// send a message, socket might be closed...
		function sendMsg(json) {
			if (ws) {
				try {
					ws.send(JSON.stringify(json));
				}
				catch (e) {
					logger.debug('[ws error] could not send msg', e);
				}
			}
		}

		// endorsement stage callback
		function endorse_hook(err) {
			if (err) sendMsg({ msg: 'tx_step', state: 'endorsing_failed' });
			else sendMsg({ msg: 'tx_step', state: 'ordering' });
		}

		// ordering stage callback
		function orderer_hook(err) {
			if (err) sendMsg({ msg: 'tx_step', state: 'ordering_failed' });
			else sendMsg({ msg: 'tx_step', state: 'committing' });
		}
	};

	//------------------------------------------------------------------------------------------

	// sch next periodic check
	function sch_next_check() {
		clearTimeout(checkPeriodically);
		checkPeriodically = setTimeout(function () {
			try {
				ws_server.check_for_updates(null);
			}
			catch (e) {
				console.log('');
				logger.error('Error in sch next check\n\n', e);
				sch_next_check();
				ws_server.check_for_updates(null);
			}
		}, g_options.block_delay + 2000);
	}

	// --------------------------------------------------------
	// Check for Updates to Ledger
	// --------------------------------------------------------
	ws_server.check_for_updates = function (ws_client) {
		marbles_lib.channel_stats(null, function (err, resp) {
			var newBlock = false;
			if (err != null) {
				var eObj = {
					msg: 'error',
					e: err,
				};
				if (ws_client) ws_client.send(JSON.stringify(eObj)); 								//send to a client
				else broadcast(eObj);																//send to all clients
			} else {
				if (resp && resp.height && resp.height.low) {
					if (resp.height.low > known_height || ws_client) {
						if (!ws_client) {
							console.log('');
							logger.info('New block detected!', resp.height.low, resp);
							known_height = resp.height.low;
							newBlock = true;
							logger.debug('[checking] there are new things, sending to all clients');
							broadcast({ msg: 'block', e: null, block_height: resp.height.low });	//send to all clients
						} else {
							logger.debug('[checking] on demand req, sending to a client');
							var obj = {
								msg: 'block',
								e: null,
								block_height: resp.height.low,
								block_delay: g_options.block_delay
							};
							ws_client.send(JSON.stringify(obj)); 									//send to a client
						}
					}
				}
			}

			if (newBlock || ws_client) {
				read_everything(ws_client, function () {
					sch_next_check();						//check again
				});
			} else {
				sch_next_check();							//check again
			}
		});
	};

	// read complete state of marble world
	function read_everything(ws_client, cb) {
		const channel = helper.getChannelId();
		const first_peer = helper.getFirstPeerName(channel);
		var options = {
			peer_urls: [helper.getPeersUrl(first_peer)],
		};

		marbles_lib.read_everything(options, function (err, resp) {
			if (err != null) {
				console.log('');
				logger.debug('[checking] could not get everything:', err);
				var obj = {
					msg: 'error',
					e: err,
				};
				if (ws_client) ws_client.send(JSON.stringify(obj)); 								//send to a client
				else broadcast(obj);																//send to all clients
				if (cb) cb();
			}
			else {
				var data = resp.parsed;
                if (data && data.accounts) {
                    console.log('');
                    logger.debug('[checking] number of owners:', data.accounts.length);
                }

                
                var knownAsString = JSON.stringify(known_everything);           //stringify for easy comparison (order should stay the same)
                var latestListAsString = JSON.stringify(data);

                if (knownAsString === latestListAsString) {
                    logger.debug('[checking] same everything as last time');
                    if (ws_client !== null) {                                   //if this is answering a clients req, send to 1 client
                        logger.debug('[checking] sending to 1 client');
                        ws_client.send(JSON.stringify({ msg: 'everything', e: err, everything: data }));
                    }
                }
                else {                                                          //detected new things, send it out
                    logger.debug('[checking] there are new things, sending to all clients');
                    known_everything = data;
                    broadcast({ msg: 'everything', e: err, everything: data }); //sent to all clients
                }
                if (cb) cb();
			}
		});
	}

        // read complete state of marble world
    function recheck_account(db) {
        const channel = helper.getChannelId();
        const first_peer = helper.getFirstPeerName(channel);
        var options = {
            peer_urls: [helper.getPeersUrl(first_peer)],
        };

        marbles_lib.read_account(options, function (err, resp) {
            if (err != null) {
                console.log('');
                logger.debug('[checking] could not get everything:', err);
                if (cb) cb();
            }
            else {//resp为read来的数据
                var data = resp.parsed;
                console.log('read succeed');
                console.log(data);
                if (data && data.accounts) {
                    logger.debug('[checking] number of accounts:', data.accounts.length);
                    for (var i in data.accounts){
                        console.log(data.accounts[i]);
                       
                    	var selectSQL = 'SELECT * FROM account WHERE `sha_value` = \'' + data.accounts[i].hash_id+'\'';
            			console.log(selectSQL);
            			db.serialize(function(){
                		// Database#each(sql, [param, ...], [callback], [complete])
                			db.each(selectSQL, function(err,row){
                    			if(err){throw err;}
                    			console.log(row);
                   				var value = "";
                    			value = row.ac_id + row.ac_short_name + row.status + row.term_date + row.inception_date + row.ac_region
                            		+ row.ac_sub_region + row.cod_country_domicile + row.liq_method + row.contracting_entity + row.mgn_entity
                           			+ row.ac_legal_name + row.manager_name + row.cod_ccy_base + row.longname + row.mandate_id + row.client_id
                            		+ row.custodian_name + row.sub_mandate_id + row.transfer_agent_name + row.trust_bank + row.re_trust_bank
                            		+ row.last_updated_by + row.last_approved_by + row.last_update_date;
                        		console.log("-----[从数据库取出来的]-----"+value);
                    		
                    			var md5 = crypto.createHash('md5');
            					md5.update(value);
            					var sha_value = md5.digest('hex');
                    			console.log("SHA-VALUE: "+sha_value);
                    			if (sha_value !== row.sha_value) {			// data change
                        			console.log("[HASH IN INDEXING] "+hash);
                        			console.log("[HASH IN ACCOUNT] "+ sha_value);
                        			sendMsg({msg: 'validity', table_name: 'account', sha_value: row.sha_value});
                        			console.log("SHA-VALUE: " + sha_value);
                    			}
                    			else {
                        			console.log("MATCH! NO PROBLEM!");
                    			}
                			}, function(err, number){
                    			if(number==0){// can not find the hash value from the table
                        			console.log('---fail---CAN NOT FOUND HASH in table '+'account');
                        			sendMsg({
                            			msg: 'validity',
                            			table_name: 'unknown',
                            			show_location: 'account',
                            			sha_value: data.accounts[i].hash_id
                        			});
                    			}
                			})
            			});
                    }
                }
            }
        });
    }

    function read_ac_trade() {
        const channel = helper.getChannelId();
        const first_peer = helper.getFirstPeerName(channel);
        var options = {
            peer_urls: [helper.getPeersUrl(first_peer)],
        };

        marbles_lib.read_ac_trade(options, function (err, resp) {
            if (err != null) {
                console.log('');
                logger.debug('[checking] could not get everything:', err);
            }
            else {//resp为read来的数据
                var data = resp.parsed;
                console.log('read succeed');
                console.log(data);
                if (data && data.accounts) {
                    logger.debug('[checking] number of accounts:', data.accounts.length);
                    for (var i in data.accounts){
                        console.log(data.accounts[i]);
                       
                    	var selectSQL = 'SELECT * FROM ac_trade WHERE `sha_value` = \'' + data.accounts[i].hash_id+'\'';
            			console.log(selectSQL);
            			db.serialize(function(){
                		// Database#each(sql, [param, ...], [callback], [complete])
                			db.each(selectSQL, function(err,row){
                    			if(err){throw err;}
                    			console.log(row);
                   				var value = "";
                    			value = row.ac_id + row.lvts + row.calypso + row.aladdin + row.trade_start_date + row.equity + row.fixed_income;
                        		console.log("-----[从数据库取出来的]-----"+value);
                    		
                    			var md5 = crypto.createHash('md5');
            					md5.update(value);
            					var sha_value = md5.digest('hex');
                    			console.log("SHA-VALUE: "+sha_value);
                    			if (sha_value !== row.sha_value) {			// data change
                        			console.log("[HASH IN INDEXING] "+row.sha_value);
                        			console.log("[HASH IN ACCOUNT] "+ sha_value);
                        			sendMsg({msg: 'validity', table_name: 'ac_trade', sha_value: row.sha_value});
                        			console.log("SHA-VALUE: " + sha_value);
                    			}
                    			else {
                        			console.log("MATCH! NO PROBLEM!");
                    			}
                			}, function(err, number){
                    			if(number==0){// can not find the hash value from the table
                        			console.log('---fail---CAN NOT FOUND HASH in table '+'ac_trade');
                        			sendMsg({
                            			msg: 'validity',
                            			table_name: 'unknown',
                            			show_location: 'ac_trade',
                            			sha_value: data.accounts[i].hash_id
                        			});
                    			}
                			})
            			});
                    }
                }
            }
        });
    }

    function read_ac_benchmark() {
        const channel = helper.getChannelId();
        const first_peer = helper.getFirstPeerName(channel);
        var options = {
            peer_urls: [helper.getPeersUrl(first_peer)],
        };

        marbles_lib.read_ac_benchmark(options, function (err, resp) {
            if (err != null) {
                console.log('');
                logger.debug('[checking] could not get everything:', err);
            }
            else {//resp为read来的数据
                var data = resp.parsed;
                console.log('read succeed');
                console.log(data);
                if (data && data.accounts) {
                    logger.debug('[checking] number of accounts:', data.accounts.length);
                    for (var i in data.accounts){
                        console.log(data.accounts[i]);
                       
                    	var selectSQL = 'SELECT * FROM ac_benchmark WHERE `sha_value` = \'' + data.accounts[i].hash_id+'\'';
            			console.log(selectSQL);
            			db.serialize(function(){
                		// Database#each(sql, [param, ...], [callback], [complete])
                			db.each(selectSQL, function(err,row){
                    			if(err){throw err;}
                    			console.log(row);
                   				var value = "";
                    			value = row.ac_id + row.benchmark_id + row.source + row.name + row.currency + row.primary_flag + row.start_date
                            		+ row.end_date + row.benchmark_reference_id + row.benchmark_reference_id_source;
                        		console.log("-----[从数据库取出来的]-----"+value);
                    		
                    			var md5 = crypto.createHash('md5');
            					md5.update(value);
            					var sha_value = md5.digest('hex');
                    			console.log("SHA-VALUE: "+sha_value);
                    			if (sha_value !== row.sha_value) {			// data change
                        			console.log("[HASH IN INDEXING] "+row.sha_value);
                        			console.log("[HASH IN ACCOUNT] "+ sha_value);
                        			sendMsg({msg: 'validity', table_name: 'ac_benchmark', sha_value: row.sha_value});
                        			console.log("SHA-VALUE: " + sha_value);
                    			}
                    			else {
                        			console.log("MATCH! NO PROBLEM!");
                    			}
                			}, function(err, number){
                    			if(number==0){// can not find the hash value from the table
                        			console.log('---fail---CAN NOT FOUND HASH in table '+'ac_benchmark');
                        			sendMsg({
                            			msg: 'validity',
                            			table_name: 'unknown',
                            			show_location: 'ac_benchmark',
                            			sha_value: data.accounts[i].hash_id
                        			});
                    			}
                			})
            			});
                    }
                }
            }
        });
    }

    function read_benchmarks() {
        const channel = helper.getChannelId();
        const first_peer = helper.getFirstPeerName(channel);
        var options = {
            peer_urls: [helper.getPeersUrl(first_peer)],
        };

        marbles_lib.read_benchmarks(options, function (err, resp) {
            if (err != null) {
                console.log('');
                logger.debug('[checking] could not get everything:', err);
            }
            else {//resp为read来的数据
                var data = resp.parsed;
                console.log('read succeed');
                console.log(data);
                if (data && data.accounts) {
                    logger.debug('[checking] number of accounts:', data.accounts.length);
                    for (var i in data.accounts){
                        console.log(data.accounts[i]);
                       
                    	var selectSQL = 'SELECT * FROM benchmarks WHERE `sha_value` = \'' + data.accounts[i].hash_id+'\'';
            			console.log(selectSQL);
            			db.serialize(function(){
                		// Database#each(sql, [param, ...], [callback], [complete])
                			db.each(selectSQL, function(err,row){
                    			if(err){throw err;}
                    			console.log(row);
                   				var value = "";
                    			value = row.benchmark_id + row.id_source + row.name + row.currency + row.benchmark_reference_id +
                            		row.benchmark_reference_id_source;
                            	console.log("-----[从数据库取出来的]-----"+value);
                    		
                    			var md5 = crypto.createHash('md5');
            					md5.update(value);
            					var sha_value = md5.digest('hex');
                    			console.log("SHA-VALUE: "+sha_value);
                    			if (sha_value !== row.sha_value) {			// data change
                        			console.log("[HASH IN INDEXING] "+row.sha_value);
                        			console.log("[HASH IN ACCOUNT] "+ sha_value);
                        			sendMsg({msg: 'validity', table_name: 'benchmarks', sha_value: row.sha_value});
                        			console.log("SHA-VALUE: " + sha_value);
                    			}
                    			else {
                        			console.log("MATCH! NO PROBLEM!");
                    			}
                			}, function(err, number){
                    			if(number==0){// can not find the hash value from the table
                        			console.log('---fail---CAN NOT FOUND HASH in table '+'benchmarks');
                        			sendMsg({
                            			msg: 'validity',
                            			table_name: 'unknown',
                            			show_location: 'benchmarks',
                            			sha_value: data.accounts[i].hash_id
                        			});
                    			}
                			})
            			});
                    }
                }
            }
        });
    }

	return ws_server;
};
