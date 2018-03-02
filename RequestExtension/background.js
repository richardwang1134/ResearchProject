chrome.webRequest.onBeforeSendHeaders.addListener(
	function(details) 
	{	console.log(details);
		return{cancel: true};
	}
,	{	urls: ["<all_urls>"],
		types: ["script"]
	}
, 	["blocking", 'requestHeaders']
);