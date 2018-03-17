//----INIT----
var WL = [];
var BR = [];

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
					console.log("Same : ",refDomain,urlDomain);
					return {cancel:false};
				}
				for(var j =0; j < WL.length; j++)
					if(refDomain == WL[j]){
						console.log("wl  : ",refDomain,urlDomain);
						return {cancel:false};
					}
				add2BR(refDomain,urlDomain);
				console.log("block: ",refDomain,urlDomain);
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