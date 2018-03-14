//----INIT----
var WL = [];
var BR = [];

//----BLOCK & CHECK REQUEST----
chrome.webRequest.onBeforeSendHeaders.addListener(
	//callback
	async (details)=>{
		for(var i = 0; i < details.requestHeaders.length; i++){
			if(details.requestHeaders[i].name === "Referer"){
				var refDomain = details.requestHeaders[i].value.split("/")[2];
				var url = details.url;
				var urlDomain = url.split("/")[2];
				if(!urlDomain.match(refDomain)){
					if(WL){
						for(var j =0; j < WL.length; j++){
							if(urlDomain == WL[j]){
								console.log("    Pass    : ",urlDomain);
								return{cancel:false};
							}
						}
					}
					var result = await delCookie(url);
					if(result[0]=="D" && result[3]==" "){
						for(var i = 0; i < BR.length; i++){
							if(urlDomain == BR[i][1]){
								BR[i][0]=getTime();
								console.log(result);
								return{cancel:false};
							}
						}
						if(i >= BR.length)
							BR.push([getTime(),urlDomain,refDomain]);
					}
					console.log(result);
					return{cancel:false};

				}	
			}
		}
	}
	//filter
,	{	urls: ["<all_urls>"],
		types: ["script"],
		//types: ["other"]
	}
	//optional, extra information specification
, 	["blocking", 'requestHeaders']
);

//----GET_WHITELIST----
function getWhiteList(){
	return new Promise(
		(resolve)=>{
			chrome.storage.sync.get(
				"whiteList",
				(item)=>{resolve(item.WL)}
			)
		}
	);
}

//----DELETE COOKIE----
function delCookie(url){
	return new Promise(
		(resolve,reject)=>{
			var urlDomain = url.split("/")[2];
			try{
				chrome.cookies.getAll({url:url},function(cookie){
					var names = [],
						num = cookie.length;
					if(num > 0){
						for (var i = 0; i < num; i++)
							names.push(cookie[i].name);
						for (var i = 0, num = names.length; i < num; i++)
							chrome.cookies.remove({url:url,name:names[i]});
						resolve("Del cookie : "+urlDomain);
					}else{
						resolve(" No coockie : "+urlDomain);
					}
				});
			}catch(e){
				reject("Delete cookie failed: "+urlDomain);
			}
		}
	);
}

function getTime(){
	var d = new(Date);
	var h = d.getHours();
	var m = d.getMinutes();
	var s = d.getSeconds();
	if(h < 10) h = "0" + h;
	if(m < 10) m = "0" + m;
	if(s < 10) s = "0" + s;
	return(h + ":" + m + ":" + s);
}

/*----SEND MSG OF [WHITELIST & BLOCK RECORD]----*/
chrome.runtime.onMessage.addListener(
	(request, sender, sendResponse)=>{
	  	if (request.get == "wl"){
			var json_str = JSON.stringify(WL);
			sendResponse({wl: json_str});
			console.log("SendWL:",WL);
		}else if(request.get == "br"){
			var json_strs = [];
			for(var i = 0; i < BR.length; i++)
				json_strs.push(JSON.stringify(BR[i]));
			var json_str = JSON.stringify(json_strs);
			sendResponse({br: json_str});
			console.log("SendBR:",BR);
		}else if (request.update){
			WL = JSON.parse(request.update);
			sendResponse({ack:JSON.stringify("OK")});
			chrome.storage.sync.set({WL:WL});
			console.log("UpdateWL:",WL);
		}	
	}
);