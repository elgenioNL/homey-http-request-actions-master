"use strict";
var latest_get;
var latest_value;
var port = 9090;

function get_flow(){
	var request = require('request');
	var express = require('express');
	var app = express();

	//listen for name and value
	app.get('/:name/:value', function (req, res) {
			latest_get = req.params.name;
			latest_value = req.params.value;
			Homey.manager('flow').trigger('http_get_value',{
    		value: latest_value
			});
			Homey.log("Request named: "+latest_get+" with value: "+latest_value);
			res.send('OK: '+latest_value);
		});

	//listen for name
	app.get('/:name', function (req, res) {
			latest_get = req.params.name;
			Homey.manager('flow').trigger('http_get');
		 	Homey.log("Request named: "+latest_get);
			res.send('OK');
		});

		var server = app.listen(port, function () {
	  var host = server.address().address
	  var port = server.address().port
	  Homey.log("HTTP Api listening at: "+ port)
	})
	Homey.manager('flow').on('trigger.http_get', function( callback, args ){
			 // Check if event triggerd is equal to event send in flow card
			 //Homey.log(args);
			 if(args.get_name === latest_get){
					Homey.log("Flow triggered: "+latest_get);
					callback( null, true);
			 } else {
				 callback( null, false);
			 }
		});

	Homey.manager('flow').on('trigger.http_get_value', function( callback, args ){
			 // Check if event triggerd is equal to event send in flow card
			 //Homey.log(args);
			 if(args.get_name === latest_get){
					Homey.log("Flow value triggered: "+latest_get);
					callback( null, true);
			 } else {
				 callback( null, false);
			 }
		});
};


var self = module.exports = {
	init: function () {
		get_flow();

		// HTTP Get Request flow action
		Homey.manager('flow').on('action.http_get', function( callback, args ){
			Homey.log("Http Get action. Passed parameter: ", args);
			var url = args.url;
			request.get(
				url,
				{},
				function (error, response, body) {
					if (!error && response.statusCode == 200) {
						// ready
						callback( null, true);
					} else {
						callback( error )
					}
				}
			)
		});

		// HTTP Post JSON  Request flow action
		Homey.manager('flow').on('action.http_post_json', function( callback, args ){
			Homey.log("Http Post action. Passed parameters: ", args);
			var url = args.url;
	   	var data = JSON.parse(args.data);
			request({
				url: url,
				method: "POST",
				json: data
				}, function (error, response, body) {
					if (!error && response.statusCode == 200) {
						// ready
						callback( null, true);
					} else {
						callback( error )
					}
				}
			)
		});

		// HTTP Put Request flow action
		Homey.manager('flow').on('action.http_put_json', function( callback, args ){
			Homey.log("Http Put action. Passed parameters: ", args);
			var url = args.url;
	   	var data = JSON.parse(args.data);
			request({
				url: url,
				method: "PUT",
				json: data},
				function (error, response, body) {
					if (!error && response.statusCode == 200) {
						// ready
						callback( null, true);
					} else {
						callback( error )
					}
				}
			)
		});
	}
}
