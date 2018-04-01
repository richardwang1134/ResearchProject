//----INIT----
var WL = []; //White List	[ref]
var BR = []; //Block Record	[time,url,ref]
var CS = []; //當前頁面的Cookie Status
var CR = []; //各網頁的Cookie設定
var URL = "";//當前頁面url


//----BLOCK & CHECK REQUEST----
/*
chrome.webRequest.onBeforeSendHeaders.addListener(
	//callback
	(details)=>{
		for(var i = 0; i < details.requestHeaders.length; i++){//取得ref
			if(details.requestHeaders[i].name === "Referer"){
				var ref = details.requestHeaders[i].value;
				var url = details.url;
				var urlDomain = url.split("/")[2];
				var refDomain = ref.split("/")[2];
				if(urlDomain.match(refDomain)){
					console.log("  Same   : ",refDomain,urlDomain);
					return {cancel:false};
				}
				for(var j =0; j < WL.length; j++)
					if(urlDomain == WL[j]){
						console.log("WhiteList: ",refDomain,urlDomain);
						return {cancel:false};
					}
				add2BR(refDomain,urlDomain);
				//procBlocked(url,ref);
				console.log("  Block  : ",refDomain,urlDomain);
				return {cancel:true};
			}
		}
	}
	//filter
,	{	urls: ["<all_urls>"],
		types: ["script"]
	}
	//optional, extra information specification
, 	["blocking", 'requestHeaders']
);
*/
/*
async function procBlocked(url,ref){
	var result = await delCookie(ref);
	console.log(result);
	$.get(
		url,
		(data)=>{
			console.log("get content(type: string) of");
			console.log(url);
		}
	);
}*/
chrome.tabs.onUpdated.addListener(
	async function (tabId, props, tab) {
		if (props.status == "loading" && tab.selected) {
		var SelectURL = false;
		CS = [];
		URL = tab.url.split("/")[2];
		CR = await getCookieRecord();
		for(var i = 0 ; i < CR.length ; i++){
			if( URL == CR[i]){
				SelectURL = true;
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

function add2BR(refDomain,urlDomain){
	for(var i = 0; i < BR.length; i++){
		if(refDomain == BR[i][2]){
			BR[i][0]=getTime();
			return{cancel:false};
		}
	}
	if(i >= BR.length)
		BR.push([getTime(),urlDomain,refDomain]);
}

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
						resolve(" No cookie  : "+urlDomain);
					}
				});
			}catch(e){
				reject("Delete cookie failed: "+urlDomain);
			}
		}
	);
}

async function printCoockie(url){
	var c = await getCookie(url);
	console.log("cccc",c);
}

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
function SetSameSite(url,cookie,sameSite){
	return new Promise((resolve)=>{
			chrome.cookies.set(
			{	
			 	url:url
				,name:cookie.name
				,value:cookie.value
				,domain:cookie.domain
				,path:cookie.path
				,secure:cookie.secure
				,httpOnly:cookie.httpOnly
				,sameSite:sameSite
				,expirationDate:cookie.expirationDate
				,storeId:cookie.storeId
			},(cookie)=>{
			resolve(cookie);
		})
	})
}
function CompareCS(url,CSCR,CS){
	return new Promise(
	async function(resolve){
		for(var i = 0 ; i < CS.length ; i++){
			for(var j = 0 ; j < CSCR.length ; j++){
				if(CS[i].name == CSCR[j].name){
					CS[i] = await SetSameSite(url,CS[i],CSCR[j].sameSite);
					//console.log(CS[i]);
				}
			}
		}
		//console.log(CS);
		resolve(CS);
	}
	);
}
/*
function Queue() {
	let items = [];
	this.remove=function(i){
		var l = items.length;
		if(i >= 0 && i < l){
			items[i] = items[l-1];
			items.pop();
		}
	}
	this.enqueue = function(element) {
		items.push(element);
	};
	this.dequeue = function() {
		return items.shift();
	};
	this.front = function() {
		return items[0];
	};
	this.isEmpty = function() {
		return items.length === 0;
	};
	this.clear = function() {
		items = [];
	};
	this.size = function() {
		return items.length;
	};
	this.print = function() {
		console.log(items);
	};
	this.toArray = function(){
		return items;
	}
	this.indexOf = function(obj){
		for(var i = 0; i < items.length; i++){
			if(obj == items[i]){
				return i;
			}
		}
		return -1;
	}
}
*/