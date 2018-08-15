package localproxypakage;

public class BrowserRequest {
	String id;
	String url;
	public BrowserRequest(String s) {
		s = s.substring(10);
		int slashIndex = s.indexOf("/");
		if(slashIndex > 0) {
			id = s.substring(0, slashIndex);
			url = s.substring(slashIndex+1);
		}else {
			id = s;
		}
		
	}
}
