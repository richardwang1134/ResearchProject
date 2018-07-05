chrome.runtime.onMessage.addListener(
    (message, sender, sendResponse)=>{
        data = JSON.parse(message);
        injectScript(data);
    }
); 



function injectScript(data){
	var scripts = document.querySelectorAll('script');
	var num = scripts.length;
	var locDomain = location.href.split("/")[2];
	for(var i = 0; i < num; i++){
		if(scripts[i].src){
			srcDomain = scripts[i].src.split("/")[2];
			if(!locDomain.match(srcDomain)){
				scripts[i].innerHTML = data;
                scripts[i].src = null;
                console.log(locDomain,srcDomain);
                console.log(scripts[i]);
			}
		} 
	}
}
