package localproxypakage;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.List;
import java.util.Map;
import javax.net.ssl.HttpsURLConnection;

public class ServerSocket {
	
	private Map<String, List<String>> mapHead = null;
	
	public BufferedReader bufferedReader = null;	
	public String encoding = "UTF-8";	
	public String head = "HTTP/1.1 200 OK\r\n";
	public boolean responseIsChunked = false;
	
	public ServerSocket(String urll) throws IOException {
		URL url = new URL(urll);
		String protocol = url.getProtocol();
		if(protocol.equals("https")) {
			HttpsURLConnection connection = (HttpsURLConnection)url.openConnection();
			mapHead = connection.getHeaderFields();
			encoding = connection.getContentEncoding();
			encoding = encoding == null ? "UTF-8" : encoding;
			bufferedReader = new BufferedReader(new InputStreamReader(connection.getInputStream(), encoding));
			head = "";
		}else{
			HttpURLConnection connection = (HttpURLConnection)url.openConnection();
			mapHead = connection.getHeaderFields();
			encoding = connection.getContentEncoding();
			encoding = encoding == null ? "UTF-8" : encoding;
			bufferedReader = new BufferedReader(new InputStreamReader(connection.getInputStream(), encoding));
			head = "";
		}
		for (Map.Entry<String, List<String>> entry : mapHead.entrySet()) {
			if(entry.getKey()==null) {
				head = entry.getValue().toArray()[0] + "\r\n" + head;
			}else{
				head 	= head + entry.getKey() + ": " + entry.getValue().toArray()[0] + "\r\n";
				if(entry.getKey().equals("Transfer-Encoding") && entry.getValue().toArray()[0].equals("chunked")) {
					responseIsChunked = true;
				}
			}
		}
	}
}
