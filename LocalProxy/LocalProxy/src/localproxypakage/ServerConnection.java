package localproxypakage;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.List;
import java.util.Map;
import javax.net.ssl.HttpsURLConnection;

public class ServerConnection {
	
	private Map<String, List<String>> mapHead = null;
	private String encoding = "UTF-8";	
	BufferedReader bufferedReader = null;	
	
	ServerConnection(String urll) throws IOException {
		URL url = new URL(urll);
		String protocol = url.getProtocol();
		if(protocol.equals("https")) {
			HttpsURLConnection connection = (HttpsURLConnection)url.openConnection();
			mapHead = connection.getHeaderFields();
			encoding = connection.getContentEncoding();
			encoding = encoding == null ? "UTF-8" : encoding;
			bufferedReader = new BufferedReader(new InputStreamReader(connection.getInputStream(), encoding));
		}else{
			HttpURLConnection connection = (HttpURLConnection)url.openConnection();
			mapHead = connection.getHeaderFields();
			encoding = connection.getContentEncoding();
			encoding = encoding == null ? "UTF-8" : encoding;
			bufferedReader = new BufferedReader(new InputStreamReader(connection.getInputStream(), encoding));
		}
	}
	ServerResponse getResponse() {
		ServerResponse response = new ServerResponse();
		response.enCoding = encoding;
		response.bufferedReader = bufferedReader;
		for (Map.Entry<String, List<String>> entry : mapHead.entrySet()) {
			if(entry.getKey()==null) {
				response.head = entry.getValue().toArray()[0] + "\r\n" + response.head;
			}else{
				response.head 	= response.head + entry.getKey() + ": " + entry.getValue().toArray()[0] + "\r\n";
				if(entry.getKey().equals("Transfer-Encoding") && entry.getValue().toArray()[0].equals("chunked")) {
					response.isChunked = true;
				}
			}
		}
		response.head = response.head + "\r\n";
		return response;
	}
}
