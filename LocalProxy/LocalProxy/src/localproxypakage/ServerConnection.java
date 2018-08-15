package localproxypakage;

import java.io.BufferedReader;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import javax.net.ssl.HttpsURLConnection;

public class ServerConnection {
	
	Map<String, List<String>> head = null;	
	BufferedReader bufferedReader = null;
	InputStream inputStream = null;
	String encoding = "UTF-8";	
	
	ServerConnection(String urll) throws IOException {
		URL url = new URL(urll);
		String protocol = url.getProtocol();
		if(protocol.equals("https")) {
			HttpsURLConnection connection = (HttpsURLConnection)url.openConnection();
			encoding = encoding == null ? "UTF-8" : encoding;
			head = connection.getHeaderFields();
			inputStream = connection.getInputStream();
		}else{
			HttpURLConnection connection = (HttpURLConnection)url.openConnection();
			encoding = encoding == null ? "UTF-8" : encoding;
			head = connection.getHeaderFields();
			inputStream = connection.getInputStream();
		}
	}
	Map<String, List<String>> getHead(){
		return head;
	}
	String getBody() throws IOException {
		ByteArrayOutputStream result = new ByteArrayOutputStream();
		byte[] buffer = new byte[1024];
		int length;
		while ((length = inputStream.read(buffer)) != -1) {
		    result.write(buffer, 0, length);
		}
		return result.toString(encoding);
	}
}
