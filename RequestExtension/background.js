chrome.webRequest.onBeforeSendHeaders.addListener(
	//callback
	function(details){
		for(var i = 0; i < details.requestHeaders.length; i++){
			if(details.requestHeaders[i].name==="Referer"){
				var ref = details.requestHeaders[i].value;
				var url = details.url;
				if(!url.match(ref)){
					console.log("ref:",ref);
					console.log("url:",url);
					console.log("------------------------------------------");
				}
			}
		}
		//return{cancel: true};
	}
	//filter
,	{	urls: ["<all_urls>"],
		types: ["script"]
	}
	//optional, extra information specification
, 	["blocking", 'requestHeaders']
);