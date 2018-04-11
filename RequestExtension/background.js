//----INIT----
var WL = []; //White List	[ref]
var BR = []; //Block Record	[time,url,ref]

//redirect request, then process blocked request
chrome.webRequest.onBeforeRequest.addListener(
	(details)=>{
		if(details.url!="http://127.0.0.1:8000/browserRequest1"){
			var url = details.url;
			var rid = details.requestId.toString();
			var tid = details.tabId;
			if(tid == -1){
				return;
			}else{
				procBlocked(url,rid,tid);
				return {redirectUrl:"http://127.0.0.1:8000/browserRequest1"};
			}
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
		console.log("send request 1 :" + rid);
		return {requestHeaders: details.requestHeaders};
	}
,	{	urls: ["http://127.0.0.1:8000/browserRequest1"],
		types: ["script"]	}

, 	["blocking","requestHeaders"]
);

//process blocked request
async function procBlocked(url,rid,tid){
	console.log(url,rid,tid);
	var ref = await getTabURL(tid);
	var refDomain = ref.split("/")[2];
	var urlDomain = url.split("/")[2];
	if(refDomain.match(urlDomain)){;
	}else if(inWL(ref)){;
	}else{
		add2BR(ref,url);
		var resulet = await delCookie(ref);
	}
	sendRequest(rid,url);
}

//send request with url that before redirect and request id
function sendRequest(rid,url){
	var xhr = new XMLHttpRequest();
	xhr.open('GET', 'http://127.0.0.1:8000/browserRequest2', true);
	xhr.setRequestHeader("originalURL",url);
	xhr.setRequestHeader("requestId",rid);
	xhr.send(); 
	console.log("send request 2 :" + rid);
}

//get url by tabId
function getTabURL(tid){
	return new Promise(
		(resolve)=>{
			chrome.tabs.get(
				tid,
				(item)=>{resolve(item.url)}
			)
		}
	)
}
chrome.tabs.onUpdated.addListener(
	async function (tabId, props, tab) {
		if (props.status == "loading" && tab.selected) {
		var SelectURL = false;
		CS = [];
		URL = tab.url.split("/")[2];
		CR = await getCookieRecord();
		if(CR){
			for(var i = 0 ; i < CR.length ; i++){
				if( URL == CR[i]){
					SelectURL = true;
				}
			}
		}		
		CS = await getCookie(tab.url);
		for(var i = 0 ; i < CS.length ; i++){
			CS[i] = await SetSameSite(tab.url,CS[i],'strict');
		}
		if(SelectURL){
			var CSCR = await getCS(URL);
			CS = await CompareCS(tab.url,CSCR,CS);
			//console.log(CS);
		}
	}
});

//confirm wheather domain is in WL
function inWL(domain){
	for(var i =0; i < WL.length; i++)
		if(domain == WL[i])	return true;
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
//GET CookieRecord
function getCookieRecord(){
	return new Promise(
		(resolve)=>{
			chrome.storage.sync.get(
				"cookieRecord",
				(item)=>{resolve(item["cookieRecord"])}
			)
		}
	);
}
function getCS(url){
	return new Promise(
		(resolve)=>{
			chrome.storage.sync.get(URL,function(items){
				resolve(items[url]);
			})
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
		}else if (request.WLupdate){
			var json_strs = JSON.parse(request.WLupdate);
				WL = json_strs;
				sendResponse({ack:JSON.stringify("OK")});
				chrome.storage.sync.set({"whiteList":WL});//貌似寫錯了?
				console.log("UpdateWL:",WL);
		}else if(request.CSupdate){
			var json_strs = JSON.parse(request.CSupdate);
			CS = json_strs;
			sendResponse({ack:JSON.stringify("OK")});
			console.log("UpdateCS:",CS);
		}else if(request.CRupdate){
			var json_strs = JSON.parse(request.CRupdate);
			CR = json_strs;
			sendResponse({ack:JSON.stringify("OK")});
			chrome.storage.sync.set({"cookieRecord":CR},function(){});
			console.log("UpdateCR:",CR);
		}
		else if(request.get=="cs"){
			var json_str = JSON.stringify(CS);
			sendResponse({cs: json_str});
			console.log("SendCS:",CS);
		}else if(request.get=="cr"){
			var json_str = JSON.stringify(CR);
			sendResponse({cr: json_str});
			console.log("SendCR:",CR);
		}else if(request.get=="url"){
			var json_str = JSON.stringify(URL);
			sendResponse({url: json_str});
			console.log("SendURL:",URL);
		}else if(request.get=="AddCR"){
			var json_str = JSON.stringify(CR);
			sendResponse({cr: json_str});
			chrome.storage.sync.set({[URL]:CS},function(){});
			console.log("Add ",CS,"on ",URL,"into CR");
		}
		else{
			console.log("error!");
		}	
	}
);
