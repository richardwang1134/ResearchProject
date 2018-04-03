package serverpakage;

import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.Socket;
import java.util.concurrent.locks.Condition;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

public class RequestHandler implements Runnable {
	final static Lock lock = new ReentrantLock();
	final static Condition condition = lock.newCondition();
	private Socket socket;
	public RequestHandler(Socket s) {
		socket = s;
	}
	@Override
	public void run() {
		//變數宣告
		
		BufferedReader input;
		String line,response="HTTP/1.0 200 OK\r\n";
		String [] items;
        
        try {//接收資料        	
			input = new BufferedReader(new InputStreamReader(socket.getInputStream()));
			line = input.readLine();
			items = line.split(" ");
			switch(items[1]) {
				case "/requestB1"://處理requestB1
					response = processRequest1(input);
					sendResponse(response);
					break;
				case "/requestB2"://處理requestB2
					processRequest2(input);
					sendResponse(response);
					break;
				default:
					sendResponse(response);
					
			}
		} catch (IOException | InterruptedException e) {
			e.printStackTrace();
		}
	}
	private String processRequest1(BufferedReader input) throws IOException, InterruptedException {
		//變數宣告
		String line,rid="",url=null,headers="",host=null;
		String []  items;
		//把input讀進headers 並個別處理特殊的header
		while(true){
			line = input.readLine();
			if(line == null) break;//讀完跳出迴圈
			items = line.split(": ");//讀header
			if(items[0].equals("requestId")){//收到requestId
				rid = items[1];
				break;
			}else {
				headers += line + "\n";
			}
		}
		//取得URL
		lock.lock();
		url = MyMap.get(rid);//先拿URL
		if(url != null) host = url.split("/")[2];
		System.out.println("----------------");
        System.out.println("on # " + Thread.currentThread().getName());
		System.out.println("first try to get url");
		System.out.println("its rid             : " + rid);
		System.out.println("got url, its domain : " + host);
		while(url==null) {//拿不到就一直等
			condition.await();//等到其它thread notify
			url = MyMap.get(rid);//再拿一次
			host = url.split("/")[2];
			System.out.println("----------------");//印出執行緒名稱
	        System.out.println("on # " + Thread.currentThread().getName());
			System.out.println("signaled, try to get url again");
			System.out.println("its rid             : " + rid);
			System.out.println("got url, its domain : " + host);
		}//拿到URL，跳出迴圈
		lock.unlock();
		//更改host domain
		items= headers.split("127.0.0.1:8000");;
		headers = items[0];
		for(int i = 1; i<items.length; i++) {
			headers = headers + host + items[i];
		}
		//送request到目標網站
		//接收網站的response
		//將response送回給瀏覽器
		//System.out.println("----------------");
		//System.out.println("New Headers : \n" + headers);
		/*
		 * 
		 * 
		 * send request and get response
		 * 
		 * 
		 */
		return "HTTP/1.0 200 OK\r\n";
	}
	private void processRequest2(BufferedReader input) throws IOException {
		String line,rid="",url="",host;
		String []  items;
		while(true){
			line = input.readLine();
			if(line == null) break;
			items = line.split(": ");
			if(items[0].equals("requestId"))	rid = items[1];
			else if(items[0].equals("orgURL")) 	url = items[1];
			if(!rid.isEmpty() && !url.isEmpty()) {
				lock.lock();
				host = url.split("/")[2]; 
				System.out.println("----------------");
		        System.out.println("on # " + Thread.currentThread().getName());
				System.out.println("set rid             : " + rid);
				System.out.println("set url, its domain : " + host);
				MyMap.set(rid, url);
				condition.signalAll();
				lock.unlock();
				break;
			}
		}
	}
	private void sendResponse(String s) throws IOException {
		DataOutputStream outToClient;
		outToClient = new DataOutputStream(socket.getOutputStream());
        outToClient.writeBytes(s);
        socket.close();
        outToClient.flush();
	}
}
