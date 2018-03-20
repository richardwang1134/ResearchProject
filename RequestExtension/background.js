//----INIT----
var WL = []; //White List	[ref]
var BR = []; //Block Record	[time,url,ref]
//const deleted = new Queue();
//const deleting = new Queue();



//----BLOCK & CHECK REQUEST----
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
				/*var k = deleted.indexOf([urlDomain,refDomain]);
				if(k!=-1){
					console.log("NC  : ",refDomain,urlDomain);
					deleted.remove(k);
					return {cancel:false};
				}*/
				for(var j =0; j < WL.length; j++)
					if(urlDomain == WL[j]){
						console.log("WhiteList: ",refDomain,urlDomain);
						return {cancel:false};
					}
				add2BR(refDomain,urlDomain);
				//deleting.enqueue([urlDomain,refDomain]);
				procBlocked(url);
				//deleting.print();
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

async function procBlocked(urlComplete){
	//var url,ref,urlPattern;
	await delCookie(urlComplete);

	/*while(!deleting.isEmpty()){
		[url,ref] = deleting.dequeue();
		await delCookie(urlComplete);
		console.log("deleted: ",urlComplete);
		deleted.enqueue([url,ref]);
		urlPattern = "*://"+url+"/*";
		chrome.tabs.query(
			{"url":urlPattern},
			(tabs)=>{
				//chrome.tabs.reload(tabs.id);
			}
		);
		
	}*/
}

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
		}else if (request.update){
			WL = JSON.parse(request.update);
			sendResponse({ack:JSON.stringify("OK")});
			chrome.storage.sync.set({WL:WL});
			console.log("UpdateWL:",WL);
		}	
	}
);

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