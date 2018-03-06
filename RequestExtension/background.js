
//----INIT----
var arr = ["www.google.com","www.gstatic.com","apis.google.com"]
var obj = {whiteList:arr}
chrome.storage.sync.set(obj);

//----REQUEST----
chrome.webRequest.onBeforeSendHeaders.addListener(
	//callback
	async (details)=>{
		for(var i = 0; i < details.requestHeaders.length; i++){
			if(details.requestHeaders[i].name === "Referer"){
				var ref = details.requestHeaders[i].value.split("/")[2];
				var url = details.url.split("/")[2];
				if(!url.match(ref)){
					var whiteList = await getWhiteList(url);
					for(var j =0; j < whiteList.length; j++){
						if(url === whiteList[j]){
							console.log("url:",url);
							console.log("--------pass--------");
							return{cancel:false};
						}
					}
					console.log("url:",url);
					console.log("--------block--------");
					return{cancel:true};
				}	
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

//----GET_WHITELIST----
function getWhiteList(url){
	return new Promise(
		(resolve)=>{
			chrome.storage.sync.get(
				"whiteList",
				(item)=>{resolve(item.whiteList)}
			)
		}
	);
}

