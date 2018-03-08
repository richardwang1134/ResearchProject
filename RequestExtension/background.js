
//----INIT----
var blockedDomain = {};
var arr = ["www.google.com","www.gstatic.com","apis.google.com"];
var obj = {whiteList:arr};
chrome.storage.sync.set(obj);

//----REQUEST----
chrome.webRequest.onBeforeSendHeaders.addListener(
	//callback
	async (details)=>{
		for(var i = 0; i < details.requestHeaders.length; i++){
			if(details.requestHeaders[i].name === "Referer"){
				var ref = details.requestHeaders[i].value.split("/")[2];
				var url = details.url.split("/")[2];
				var urlDomain = details.url;

				if(!url.match(ref)){
					var whiteList = await getWhiteList(url);

					for(var j =0; j < whiteList.length; j++){
						if(url === whiteList[j]){
							console.log("url:",url);
							console.log("--------pass--------");
							return{cancel:false};
						}
					}
					//console.log("url:",url);
					console.log("--------block--------");
					//delete cookies
					var cookies = await GetCookie(urlDomain);
					var names=[],num= cookies.length;
					//console.log(cookies);
					if(num){
						for (i = 0; i < num; i++)
							names.push(cookies[i].name);
						for (i=0;i<names.length;i++)
							chrome.cookies.remove({url:urlDomain,name:names[i]});
							//console.log(names[i]," has been deleted!");
						console.log("cookies on ",url,"have been deleted!");
					}
					else{
						console.log("empty!");
					}



				
					//blockedDomain.push(url);
					return{cancel:true};
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
//----GET Cookies----
function GetCookie(url){
	return new Promise(
		(resolve)=>{
			chrome.cookies.getAll({url:url},function(cookies){
				resolve(cookies)
			});
		}
	);
}

