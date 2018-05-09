package serverpakage;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.ByteArrayOutputStream;
import java.io.DataInputStream;
import java.io.DataOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.io.UnsupportedEncodingException;
import java.net.HttpURLConnection;
import java.net.Socket;
import java.net.URL;
import java.util.List;
import java.util.Map;
import java.util.concurrent.locks.Condition;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

import javax.net.ssl.HttpsURLConnection;

public class MyHandler implements Runnable {
	//lock
	final static Lock lock = new ReentrantLock();
	final static Condition condition = lock.newCondition();
	//client
	private String clientIP;
	private Socket browserSocket;
	private String browserRequestHead;
	private InputStream browserInputStream;
	private OutputStream browserOutputStream;
	//server
	private InputStream serverInputStream = null;
	private String serverRequestURL;
	//response
	private String responseHead ="HTTP/1.1 200 OK\r\n";
	private String responseEncoding = "UTF-8";
	private String responseBody = null;
	private Map<String, List<String>> responseMapHead = null;
	
	public MyHandler(Socket socket) throws IOException {
		browserSocket = socket;
		browserInputStream = browserSocket.getInputStream();
		browserOutputStream = browserSocket.getOutputStream();
		clientIP = browserSocket.getRemoteSocketAddress().toString().split(":")[0];
	}
	@Override 
	public void run() {
        try {
        	if(clientIP.equals("/127.0.0.1")) {
        		
        		browserRequestHead = readRequestHead(browserInputStream);
        		String browserRequestType = innerText(browserRequestHead,"GET /"," HTTP");       		
        		switch(browserRequestType) {        		
	        		case "browserRequest1":        			
	        			getServerRequestURL();
	        			connectByURL();
	        			passResponseHead();
	        			passResponseBody();
	        			break;
	        		case "browserRequest2":
	        			setServerRequestURL();
	        			sendResponse();
	        			break;
	        		default:
	        			break;
        		}
        	}
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
	
	private String readRequestHead(InputStream inputStream) {
		BufferedReader bufferedReader = new BufferedReader(new InputStreamReader(inputStream));
	    String head = "";
	    try {
	    	while (true) {
				String line = bufferedReader.readLine();
	    		if (line == null) break;
	    		head += line+"\n";
	    		if (line.length() == 0) break;
	    	}
	    } catch (Exception e) {}	    
	    return head;
	}
	private String innerText(String text, String begin, String end) {
	    int beginStart = text.indexOf(begin);
	    if (beginStart < 0) return null;
	    int beginEnd = beginStart+begin.length();
	    int endStart = text.indexOf(end, beginEnd);
	    if (endStart < 0) return null;
	    return text.substring(beginEnd, endStart);
	}

	private void getServerRequestURL() throws Exception {
		String 	browserRequestId=null;
		browserRequestId = innerText(browserRequestHead,"requestId: ","\n");
		if(browserRequestId != null) {
			lock.lock();
			serverRequestURL = MyMap.get(browserRequestId);
			while(serverRequestURL == null) {
				condition.await();
				serverRequestURL = MyMap.get(browserRequestId);
			}
			MyMap.del(browserRequestId);
			lock.unlock();
		}
		printMapStatus("GET",browserRequestId,serverRequestURL);
		return;
	}
	private void connectByURL() throws IOException {
		URL url = new URL(serverRequestURL);
		if(url.getProtocol().equals("http")) {
			HttpURLConnection serverConnection = (HttpURLConnection)url.openConnection();
			serverInputStream = serverConnection.getInputStream();
			responseMapHead = serverConnection.getHeaderFields();
			responseEncoding = serverConnection.getContentEncoding();
			
		}else if(url.getProtocol().equals("https")) {
			HttpsURLConnection serverConnection = (HttpsURLConnection)url.openConnection();
			serverInputStream = serverConnection.getInputStream();
			responseMapHead  = serverConnection.getHeaderFields();		
			responseEncoding = serverConnection.getContentEncoding();
		}else {
			return;
		}	
	}
	private void passResponseHead() {
		responseHead = "";
		for (Map.Entry<String, List<String>> entry : responseMapHead.entrySet()) {
			if(entry.getKey()==null) {
				responseHead = entry.getValue().toArray()[0] + "\r\n" + responseHead;
			}else if(entry.getKey().equals("Transfer-Encoding") && entry.getValue().toArray()[0].equals("chunked")){
				;
			}else {
				responseHead 	= responseHead 
								+ entry.getKey() + ": "
								+ entry.getValue().toArray()[0] + "\r\n";
			}
		}
		responseHead = responseHead + "\r\n";
	}
	private void passResponseBody() throws IOException {
		//send response to browser
		BufferedWriter bufferedWriter = new BufferedWriter(new OutputStreamWriter(browserOutputStream, "UTF8"));
		bufferedWriter.write(responseHead);
		if(responseBody!=null) {
			bufferedWriter.write(responseBody);
		}
		bufferedWriter.close();
	}
	
	private void setServerRequestURL() throws IOException {
		String 	browserRequestId=null;
		String 	serverRequestURL=null;
		browserRequestId = innerText(browserRequestHead,"requestId: ","\n");
		serverRequestURL = innerText(browserRequestHead,"originalURL: ","\n");
		if(browserRequestId!=null && serverRequestURL!=null) {
			lock.lock();
			MyMap.set(browserRequestId, serverRequestURL);
			condition.signalAll();
			lock.unlock();
			printMapStatus("SET",browserRequestId,serverRequestURL);
		}
	}
	private void sendResponse() throws IOException {
		//send response to browser
		BufferedWriter bufferedWriter = new BufferedWriter(new OutputStreamWriter(browserOutputStream, "UTF8"));
		bufferedWriter.write(responseHead);
		if(responseBody!=null) {
			bufferedWriter.write(responseBody);
		}
		bufferedWriter.close();
	}
	
	private void printMapStatus(String status,String Id,String url) {
		String threadName = Thread.currentThread().getName();
		System.out.println("---------------------------------------");
		System.out.println(status+" MyMap on # " + threadName);
		System.out.println("Id # : " + Id);
		System.out.println("URL : " + url);
	}

	private void getResponseHead() {
		responseHead = "";
		for (Map.Entry<String, List<String>> entry : responseMapHead.entrySet()) {
			if(entry.getKey()==null) {
				responseHead = entry.getValue().toArray()[0] + "\r\n" + responseHead;
			}else {
				responseHead 	= responseHead 
								+ entry.getKey() + ": "
								+ entry.getValue().toArray()[0] + "\r\n";
			}
		}
		responseHead = responseHead + "\r\n";
	}
	private void passResponseBody(InputStream inputStream) {
		try {
			DataInputStream dataInputStream = new DataInputStream(inputStream);
			ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
			byte[] buffer = new byte[1024];
			int n = 0;
			while ((n=dataInputStream.read(buffer))!=-1) {
				byteArrayOutputStream.write(buffer, 0, n);
			}
			byteArrayOutputStream.close();
			dataInputStream.close();
			responseBody = byteArrayOutputStream.toByteArray().toString();
	    } catch (Exception e) {}
	}
	private void passChunkedResponseBody(InputStream inputStream) throws IOException {
		
		BufferedWriter bufferedWriter = new BufferedWriter(new OutputStreamWriter(browserOutputStream, "UTF8"));
		bufferedWriter.write(responseHead);
		if(responseBody!=null) {
			bufferedWriter.write(responseBody);
		}
		bufferedWriter.close();
		
		String buffer,responseBodyString="",chunkString="";
		try {
			responseEncoding = responseEncoding == null ? "UTF-8" : responseEncoding;
			BufferedReader bufferedReader = new BufferedReader(new InputStreamReader(inputStream, responseEncoding));
			while((buffer = bufferedReader.readLine())!=null) {
				if(buffer.length() == 0) {
					bufferedWriter.write(chunkString);
					chunkString = "";
				}else {
					chunkString = chunkString + buffer + "\r\n";		
				}
			}
			chunkString = "0\r\n\r\n";
			bufferedWriter.write(chunkString);
			bufferedWriter.close();
	    } catch (Exception e) {}
	}
}

