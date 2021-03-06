var checker = {};

checker.name = "mySQL";
checker.params = {
	"required":[
		"host",
		"user",
		"password",
		"database",
		"query",
		"responseColumn"
	],
	"optional":[
		"port"
	]
};

checker.check = function(api, params, next){
	var checkID = params.query + "~" + params.host;
	if (typeof api.nodeChecker.apiData.mySQL.connections === 'undefined'){
		api.nodeChecker.apiData.mySQL.connections = {};
	}

	var response = {};
	response.error = false;
	response.check = false;
	response.number = 0;
	if(params.port == null){params.port = "3306";}
	response.error = api.utils.checkParamChecker(api, checker.params["required"], params);
	if(response.error == false){
		try{

			if(api.nodeChecker.apiData.mySQL.connections[checkID] == null){
				api.nodeChecker.apiData.mySQL.connections[checkID] = api.mysql.createClient({
				  host: params.host,
				  port: params.port,
				  user: params.user,
				  password: params.password,
				  database: params.database,
				});
			}
			
			var client = api.nodeChecker.apiData.mySQL.connections[checkID];

			client.query('USE '+params.database, function(err) {
			  if (err) {
			  	response.number = 0;
			  	console.log(err.message);
			  	response.error = err.message;
			    next(response);
			  }else{
			  	client.query(params.query, function(err, results, fields){
					if (err) {
						response.number = 0;
					  	console.log(err.message);
					  	response.error = err.message;
					}else{
				  		if(results.length > 1){
				  			response.check = true;
				  			response.number = results.length;
				  		}else if(results.length < 1){
							console.log("no results!");
				  			response.check = false;
				  			response.number = 0;
				  		}else{
				  			response.check = true;
				  			response.number = results[0][params.responseColumn];
				  		}
					}
			  		next(response);
			  	});
			  }
			});
		}catch(e){
			response.error = "error connecting to mySQL server: "+params.host;
			next(response);
		}
	}else{
		next(response);
	}
};

/////////////////////////////////////////////////////////////////////
// exports
exports.checker = checker;