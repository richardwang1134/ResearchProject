import java.io.IOException;
import java.io.OutputStream;
import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.InputStreamReader;
import java.net.InetSocketAddress;
import java.net.HttpURLConnection;
import java.net.URL;
import com.sun.net.httpserver.Headers;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;
import java.util.Map;
import java.util.List;

public class GetServer {

	private static List 
	

    public static void main(String[] args) throws Exception {
        HttpServer server = HttpServer.create(new InetSocketAddress(8000), 0);
        server.createContext("/test", new MyHandler());
        server.setExecutor(null); // creates a default executor
        server.start();
    }

	public static synchronized int increase() {
			return count++;
	}
	public static synchronized int decrease() {
			return count--;
	}

    static class MyHandler implements HttpHandler {

        @Override
        public void handle(HttpExchange ex) throws IOException {
			new Thread(new Runnable(){
				@Override
				public void run() {
					try{
						switch (ex.getRequestHeaders().getFirst("requestType")){
							case "1":
								procRequest1(ex);
								break;
							case "2":
								procRequest2(ex);
								break;
						}
					} catch (IOException ie) {
                        ie.printStackTrace();
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
				}
			}).start();
		}

		private void procRequest1(HttpExchange ex) throws Exception {
			//wait until Request2 arrive, get orgurl
			//ref to requestB1 header, make requestP header
			/*
			Headers headersB = ex.getRequestHeaders();
			Headers headersP = new Headers();
			for (Map.Entry<String, List<String>> entry : headersB.entrySet()) {
				String headerName = entry.getKey();
				for (String headerValue : entry.getValue()){
					if(headerValue.equals("127.0.0.1:8000")){
						headersP.add(headerName, "123");
					}else if(headerName.equals("Referer")){
						;//":" is illegal char in header
					}else{
						headersP.add(headerName, headerValue);
					}
				}
			}*/
			// send requestP recv responseP
			/*
			String response;
			try{
				response = sendRequest(headersP);
				ex.sendResponseHeaders(200, response.length());
				OutputStream os = ex.getResponseBody();
				os.write(response.getBytes());
				os.close();
			}catch(Exception e){
				System.out.println(e.getMessage());
			}
			*/
		}

		private void procRequest2(HttpExchange ex) throws Exception {
			Headers headers = ex.getRequestHeaders();
			String requestId = headers.getFirst("requestId");
			String orgURL = headers.getFirst("OrgURL");
			System.out.println(requestId+"\n"+orgURL);
		}

		private String sendRequest(Headers headers) throws Exception {
			
			//set Connection
			String url = headers.getFirst("OrgURL");
			headers.remove("OrgURL");
			URL obj = new URL(url);
			HttpURLConnection con = (HttpURLConnection) obj.openConnection();
			//set method
			con.setRequestMethod("GET");
			//set header
			for (Map.Entry<String, List<String>> entry : headers.entrySet()) {
				String headerName = entry.getKey();
				for (String headerValue : entry.getValue()){
					con.addRequestProperty(headerValue, headerName);
				}
			}
			//recv response
			int responseCode = con.getResponseCode();
			System.out.println("Sending 'GET' request to URL :\n" + url);
			System.out.println("Response Code : " + responseCode);
	
			BufferedReader in = new BufferedReader(
					new InputStreamReader(con.getInputStream()));
			String inputLine;
			StringBuffer response = new StringBuffer();
	
			while ((inputLine = in.readLine()) != null) {
				response.append(inputLine);
			}
			in.close();
	
			//print result
			//System.out.println(response.toString());
			return response.toString();
	
		}
    }
}