
//----(TEST DATA)----
var blockedDomain = {};
var WLTest = ["www.google.com","www.gstatic.com","apis.google.com"];
var Rd1 = ["10:00:01","url1","ref1"];
var Rd2 = ["10:00:02","url2","ref2"];
var Rd3 = ["11:10:01","url3","ref3"];
var RdTest = [Rd1,Rd2,Rd3];
var obj = {whiteList:WLTest};
chrome.storage.sync.set(obj);

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
					var whiteList = await getWhiteList();
					for(var j =0; j < whiteList.length; j++){
						if(urlDomain === whiteList[j]){
							console.log("    Pass    : ",urlDomain);
							return{cancel:false};
						}
					}
					var result = await delCookie(url);
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
				(item)=>{resolve(item.whiteList)}
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

/*----SEND MSG OF [WHITELIST & BLOCK RECORD]----*/
chrome.runtime.onMessage.addListener(
	(request, sender, sendResponse)=>{
	  	if (request.get == "wl"){
			var json_str = JSON.stringify(WLTest);
			sendResponse({wl: json_str});
			console.log("SendWL:",WLTest);
		}
		else if (request.update){
			WLTest = JSON.parse(request.update);
			sendResponse({ack:JSON.stringify("OK")});
			console.log("UpdateWL:",WLTest);
		}	
	}
);