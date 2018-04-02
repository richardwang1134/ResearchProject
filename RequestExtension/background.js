//----INIT----
var WL = []; //White List	[ref]
var BR = []; //Block Record	[time,url,ref]
sendRequest("123","456");

//redirect request, then process blocked request
chrome.webRequest.onBeforeRequest.addListener(
	(details)=>{
		if(details.url!="http://127.0.0.1:8000/test"){
			var url = details.url;
			var rid = details.requestId.toString();
			var tid = details.tabId;
			procBlocked(url,rid,tid);
			return {redirectUrl:"http://127.0.0.1:8000/test"};
		}
	}
,	{	urls: ["<all_urls>"],
		types: ["script"]
	}
, 	["blocking"]
);

//add new header -- requestId
chrome.webRequest.onBeforeSendHeaders.addListener(
	(details)=>{
		var rid = details.requestId.toString();
		var obj = {"name":"requestId","value":rid};
		details.requestHeaders.push(obj);
		obj = {"name":"requestType","value":"1"};
		details.requestHeaders.push(obj);
		return {requestHeaders: details.requestHeaders};
	}
,	{	urls: ["http://127.0.0.1:8000/test"],
		types: ["script"]	}

, 	["blocking","requestHeaders"]
);

//process blocked request
async function procBlocked(url,rid,tid){
	var ref = await getTabURL(tid);
	var refDomain = ref.split("/")[2];
	var urlDomain = url.split("/")[2];
	if(refDomain.match(urlDomain)){;
	}else if(inWL(ref)){;
	}else{
		add2BR(ref,url);
		var resulet = await delCookie(ref);
	}
	sendRequest(url,rid);
}

//send request with url that before redirect and request id
function sendRequest(url,rid){
	console.log("OK");
	var xhr = new XMLHttpRequest();
	xhr.open('GET', 'http://127.0.0.1:8000/test', true);
	xhr.setRequestHeader("orgURL",url);
	xhr.setRequestHeader("requestId",rid);
	xhr.setRequestHeader("requestType","2");
	xhr.send(); 
}

//get url by tabId
function getTabURL(tid){
	return new promise(
		(resolve)=>{
			chrome.tabs.get(tid,(item)=>{
				resolve(item.url);
			});
		}
	);
}

//confirm wheather domain is in WL
function inWL(domain){
	for(var i =0; i < WL.length; i++)
		if(domain == WL[j])	return true;
	return false;
}

//add record to block record list
function add2BR(ref,url){
	refDomain = ref.split("/")[2];
	urlDomain = url.split("/")[2];
	for(var i = 0; i < BR.length; i++){
		if(refDomain == BR[i][2]){
			BR[i][0]=getTime();
			return{cancel:false};
		}
	}
	if(i >= BR.length)
		BR.push([getTime(),urlDomain,refDomain]);
}

//get white list
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

//delete cookie by url
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
						resolve(" No cookie  : "+urlDomain);
					}
				});
			}catch(e){
				reject("Delete cookie failed: "+urlDomain);
			}
		}
	);
}

//get cookie by url
function getCookie(url){
	return new Promise(
		(resolve)=>{
			chrome.cookies.getAll(
				{url:url},
				(cookie)=>{
					if(cookie) resolve(cookie);
					else resolve("No Cookie");
				}
			)
		}
	)
}

//get time
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

//communicate with popup page
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
