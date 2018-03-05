chrome.webRequest.onBeforeSendHeaders.addListener(
	//callback
	function(details){
		for(var i = 0; i < details.requestHeaders.length; i++){
			if(details.requestHeaders[i].name==="Referer"){
				var ref = details.requestHeaders[i].value;
				var url = details.url;
				refDomain = ref.split("/")[2];
				urlDomain = url.split("/")[2];
				if(!urlDomain.match(refDomain)){
					console.log("ref:",refDomain);
					console.log("url:",urlDomain);
					console.log("------------------------------------------");
				}
			}
		}
		return{cancel: true};
	}
	//filter
,	{	urls: ["<all_urls>"],
		types: ["script"]
	}
	//optional, extra information specification
, 	["blocking", 'requestHeaders']
);