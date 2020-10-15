var request = require('request');
require('dotenv').config();

/* GET CHART DATA from vantage, where chart formats are pre made
* str : ticker symbol
* type : SMA, TIME_SERIES_DAILY
* length : 365, 90
* interval: daily, weekly, 60min, 15min,
* callback(err, res); */
function getVantageChart(str, type, length, interval, callback) {
	if (!(length)) length = 254;  //one year of buesiness days
	if (!(interval)) interval = "daily";
	if (!(type))  type = "TIME_SERIES_DAILY";
	//https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=amzn&interval=daily&time_period=daily&series_type=close&outputsize=full&apikey=
	var url = "https://www.alphavantage.co/query?function="+ type +"&symbol="+ str +"&interval="+interval+"&time_period="+ length +"&series_type=close&outputsize=full&apikey=" + process.env.VANTAGE_KEY;
	request(url, function (err, resp, body) {
		if (err) {
			callback(err, null);
		} else {
			try {
				body = JSON.parse(body);
			} catch (e) {
				callback("ERROR (getVantageChart) JSON.parse failed!", null);
			}
			
			var name = "";
			switch (type.toUpperCase()) {
				case 'SMA':
					name = "Technical Analysis: SMA";
					break;
				case 'TIME_SERIES_DAILY':
					name = "Time Series (Daily)";
					break;
			}

			//remove number in front of open and close fields, also convert strings to numbers, and return only the data
			var data = {};
			var sub = {};
			if (body[name]) {
				var i = 1;
				try {
					for (var day in body[name]) {
						if (i <= length) {
							data[day] = {};
							if (i < 64 && length == 254) sub[day] = {};
							for (var row in body[name][day]) {
								var index = row.replace(/[0-9]. /, "");
								var dp = Number(body[name][day][row]);
								data[day][index] = dp;
								if (i < 64 && length == 254) {  //if your make a 1 year than make a 3 month
									sub[day][index] = dp;
								}
							}
							i++;
						} else {
							throw "done";
						}
					}
					callback("did not send a done message", data);	
				} catch (e) {
					var year = name + "_year";
					var month = name + "_3month";
					callback(null, {year: data, month: sub});
				}	
			} else {
				callback(body, null);
			}
		}
	});
}

// TEST STOCK CHART DATA
// getVantageChart("MMM", null, null, null, (err, res) => {
// 	var i = 1;
// 	for (var key in res.month) {
// 		console.log(i + "  " +  key);
// 		i++;
// 	}
// })


function getStock(str, callback) {
	str = str.replace(/1$/g, "");
	str = str.replace(/1$/g, "");
	str = str.replace(/1$/g, "");
	//Peer and finicials have been removed from teer
	// https://cloud.iexapis.com/stable/stock/HD/batch?types=company,logo,quote,stats,news,earnings&token=
	var url = 'https://cloud.iexapis.com/stable/stock/' + str + '/batch?types=company,logo,quote,stats,news,earnings&token=' + process.env.IEX_CLOUD_SECRET_TOKEN;

	// https://sandbox.iexapis.com/stable/stock/amzn/batch?types=company,quote,logo,news,chart,balance-sheet,earnings,cash-flow&range=1m&last=10&token=Tsk_a0ec83cc7b884b0eb6a0facb3792ef2e
	//var url = 'https://sandbox.iexapis.com/stable/stock/'+ str + '/batch?types=company,quote,logo,stats,news,balance-sheet,earnings,cash-flow&token=' + process.env.IEX_CLOUD_SANDBOX_SECRET_TOKEN;
	request(url, function (err, resp, body) {
		if (err) {
			callback("ERROR (search->getStock) request returned a error " + err, null);
		} else {
			try {
				body = JSON.parse(body);
				body["url"] = url;
			} catch (e) {
				return callback("ERROR (search->getStock) JSON.parse failed! " + e, null);
			}
			callback(null, body);
		}
	});
}


/* GET MAJOR INDICES PRICE DATA in PARALLEL
* callback (err, res)
*/
function getIndices(callback) {
			//https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=^IXIC&apikey=your_api_key&outputsize=compact
			request("https://financialmodelingprep.com/api/v3/quote/%5EGSPC,%5EDJI,%5EIXIC?apikey=" + process.env.FIN_MODEL_PREP_API_KEY, function (err, resp, body) {
				if (err) {
					reject("ERROR (getIndices->getPrice->promise) an error occurred during request  \n " + err);
				} else {
					try {
						body = JSON.parse(body);
						callback(null, body);
					} catch (e) {
						callback("ERROR (getIndices->promise->getData) JSON.parse failed!", null);
					}



					// for (var obj of body) {
					// 	var name = 
					// }
					// var name = body["Meta Data"]["2. Symbol"];
					// var dateStr = body["Meta Data"]["3. Last Refreshed"];
					// var data = body["Time Series (Daily)"];
					
					// var open = "";
					// var close = "";
					// var high = "";
					// var low = "";
					// var volume = "";
					// var lastClose = "";
					// var i = 0;
					// for (var line in data) {
					// 	if (i == 0) {
					// 		i++;
					// 		open = data[line]["1. open"];
					// 		close = data[line]["4. close"];
					// 		high = data[line]["2. high"];
					// 		low = data[line]["3. low"];
					// 		volume = data[line]["5. volume"];
					// 	} else if (i == 1) {
					// 		lastClose = data[line]["4. close"];
					// 		resolve({"name" : name, "dateStr" : dateStr, "open" : open, "low" : low, "high" : high, "close" : close, "volume" : volume, "lastClose" : lastClose});
					// 		i++;
					// 	}
				
				}
				// 	}
				// }
			});
		}
	
	// var par = []; //parrellel
	// par.push(getData("DJI"));
	// par.push(getData("GSPC"));
	// par.push(getData("IXIC"));
	//get

	// Promise.all(par).then(function(values) {
	//   console.log(values);
	//   callback(null, values);
	// }).catch(function(values) {
	//   callback(values);
	// });

/*GET CHOSEN STOCK INDEX. series is the time series
callback(err, json)
*/
function getMarketData(symbol, callback) {
	request("https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=" + '^' + symbol + "&apikey=" + process.env.VANTAGE_KEY + "&outputsize=compact", function (err, resp, body) {
	    if (err) {
	      callback(err, null);
	    } else if (body){
			try {
				body = JSON.parse(body);
			} catch (e) {
				callback("ERROR (getMarketData) JSON.parse failed");
			}
			var json = body["Time Series (Daily)"];
			//console.log(body)
			try {
				for (var key in json) {
					throw json[key];
				}
			} catch (e) {
				var json = {}
				for (var key in e) {
					if(e[key].match(/[0-9]\.[0-9]/g)) {
						e[key] = e[key].replace(/[0-9][0-9]$/g, "");
						console.log(e[key]);
					}
					json[key.slice(3)] = e[key];
				}
				json["name"] = body["Meta Data"]["2. Symbol"];
				//get a formatted date
				getStock("AAPL", (err, stock) => {
					if (err) {
						callback(err, null);
					} else {
						json["dateStr"] = stock.quote.latestTime;
						callback(null, json)
					}
				});
			}
	    } else {
	    	//console.log("ERROR (getMarketData) body is null from request");
	    	callback("ERROR (getMarketData) body is null from request", null);
	    }
	});
}


/* GET STOCK PEERS DATA
	array: is a an array of tickers
	callback(err, res) */
function getPeers(array, callback) {
	var str = "";
	for (var i in array) {
		str = str + ',' + array[i];
	}
	if (str.length <= 0) {
		callback("(search->getPeers) no tickers in the peer array");
		return;
	}
	var url = 'https://api.iextrading.com/1.0/stock/market/batch?symbols=' + str + '&types=quote,logo';
	request(url, function (err, resp, body) {
		if (err) {
			callback("ERROR (search->getPeers) request returned a error " + err, null);
		} else {
			try {
				body = JSON.parse(body);
				body["url"] = url;
			} catch (e) {
				return callback("ERROR (search->getPeers) JSON.parse failed!" + e, null);
			}
			callback(null, body);
		}
	});
}

/*GET MARKET NEWS and send back the data
TODO : append a source tag to the end*/
function getNews(callback) {
	request("https://newsapi.org/v2/top-headlines?sources=business-insider&apiKey=" + process.env.NEWS, (err, body, resp) => {
		if (err) {
			callback(err, null);
		} else if (body) {
			var data = {};
			try {
				data = JSON.parse(body.body);
			} catch (e) {
				callback("ERROR (getNews) JSON.parse failed");
			}
			callback(null, data)
			//console.log(JSON.stringify(data, null, 2));
		} else {
			callback("ERROR (getNews) body is null from get request");
		}
	});
}

module.exports = {
	getStock : getStock,
	getMarketData : getMarketData,
	getVantageChart : getVantageChart,
	getIndices : getIndices,
	getPeers : getPeers,
	getNews: getNews
}
