package serverpakage;

import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.Socket;
import java.net.URL;
import java.util.concurrent.locks.Condition;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

import javax.net.ssl.HttpsURLConnection;

public class MyHandler implements Runnable {
	
	final static Lock lock = new ReentrantLock();
	final static Condition condition = lock.newCondition();
	private String longline = "---------------------------------------";
	private String serverRequest ="";	
	private Socket serverSocket;
	private Socket browserSocket;
	private String browserRequest ="";
	private String response ="HTTP/1.0 200 OK\r\n";
	private BufferedReader bufferedReader;
	
	//Constructor
	public MyHandler(Socket socket) {
		browserSocket = socket;
	}	
	
	//override Runnable, when executor.execute, run on new thread 
	@Override 
	public void run() {

		String line;
		String [] items;
        
        try {        	
        	bufferedReader = new BufferedReader(new InputStreamReader(browserSocket.getInputStream()));
			line = bufferedReader.readLine();//read request line of  browser request
			browserRequest += line + "\r\n";
			items = line.split(" ");
			switch(items[1]) {//switch browser request type
				case "/browserRequest1":
					processBrowserRequest1();
					sendBrowserResponse();
					break;
				case "/browserRequest2":
					processBrowserRequest2();
					sendBrowserResponse();
					break;
				default:
					sendBrowserResponse();					
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
	private void processBrowserRequest1() throws Exception {
		CharSequence 	replaceTarget,
						replacement;
		String 	line,
				browserRequestId=null,
				serverRequestURL=null,
				serverRequestHost=null;
		String []  items;
		//start read browser request headers
		while(bufferedReader.ready()&&(line = bufferedReader.readLine())!=null){
			items = line.split(": ");
			if(items[0].equals("requestId")){//get request Id from header
				browserRequestId = items[1];
			}else {
				browserRequest += line + "\r\n";
			}			
		}
		//System.out.println(longline);
		//System.out.println(browserRequest);
		//get URL from MyMap
		lock.lock();
		serverRequestURL = MyMap.get(browserRequestId);
		while(serverRequestURL == null) {
			condition.await();
			serverRequestURL = MyMap.get(browserRequestId);
		}
		MyMap.del(browserRequestId);
		lock.unlock();
		//print what we got		
		serverRequestHost = serverRequestURL.split("/")[2]; 
		printMapStatus("GET",browserRequestId,serverRequestHost);
		//host 127.0.0.1:8000 => host serverRequestHost
		items = serverRequestURL.split("/");
		replaceTarget = "127.0.0.1:8000";
		replacement   = items[2];	
		serverRequest = browserRequest.replace(replaceTarget, replacement);
		//browserRequestURL => serverRequestURL
		replaceTarget = "/browserRequest1";
		replacement   = "";
		for(int i = 3; i<items.length; i++) {
			replacement = replacement + "/" + items[i];
		}
		serverRequest = serverRequest.replace(replaceTarget, replacement);
		//send request to server
		sendServerRequest(serverRequestURL);
		return;
	}
	private void processBrowserRequest2() throws IOException {
		String 	line,
				browserRequestId="",
				serverRequestURL="",
				serverRequestHost="";
		String []  items;
		//read browser request 2
		while((line = bufferedReader.readLine())!=null){
			items = line.split(": ");
			if(items[0].equals("requestId"))		browserRequestId = items[1];
			else if(items[0].equals("originalURL")) serverRequestURL = items[1];
			if(browserRequestId.isEmpty());
			else if(serverRequestURL.isEmpty());
			else{//if both id and url are NOT empty
				lock.lock();
				MyMap.set(browserRequestId, serverRequestURL);
				condition.signalAll();
				lock.unlock();
				break;
			}
		}
		serverRequestHost = serverRequestURL.split("/")[2];
		printMapStatus("SET",browserRequestId,serverRequestHost);
	}
	private void sendBrowserResponse() throws IOException {
		//send response to browser
		DataOutputStream dataOutputStream = new DataOutputStream(browserSocket.getOutputStream());
		dataOutputStream.writeBytes(response);
        browserSocket.close();
        return;
	}
	private void sendServerRequest(String requestURL) throws Exception {		
		String line;		
		//construct socket
		URL url = new URL(requestURL);
		int port = url.getPort();
		if(port == -1) port = 80;
		String protocol = url.getProtocol();
		if(protocol.equals("http")) {
			serverSocket = new Socket(url.getHost(), port);		
			//send request to server
			DataOutputStream dataOutputStream = new DataOutputStream(serverSocket.getOutputStream());
			dataOutputStream.writeBytes(serverRequest);		
			//read response from server
			bufferedReader = new BufferedReader(new InputStreamReader(serverSocket.getInputStream()));
			while((line = bufferedReader.readLine())!=null) {
				response += line + "\n";
			}
		}else if(protocol.equals("https")) {
			HttpsURLConnection conn = (HttpsURLConnection)url.openConnection();
			bufferedReader = new BufferedReader(new InputStreamReader(conn.getInputStream()));
			while((line = bufferedReader.readLine())!=null) {
				response += line + "\n";
			}
		}
		System.out.println(longline);
		System.out.println(response.substring(0, 100));
		return;		
	}
	private void printMapStatus(String status,String Id,String host) {
		String threadName = Thread.currentThread().getName();
		System.out.println(longline);
		System.out.println(status+" MyMap on # " + threadName);
		System.out.println("Id # : " + Id);
		System.out.println("Host : " + host);
		return;
	}
}

