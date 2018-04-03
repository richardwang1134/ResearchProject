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
		//�ܼƫŧi
		
		BufferedReader input;
		String line,response="HTTP/1.0 200 OK\r\n";
		String [] items;
        
        try {//�������        	
			input = new BufferedReader(new InputStreamReader(socket.getInputStream()));
			line = input.readLine();
			items = line.split(" ");
			switch(items[1]) {
				case "/requestB1"://�B�zrequestB1
					response = processRequest1(input);
					sendResponse(response);
					break;
				case "/requestB2"://�B�zrequestB2
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
		//�ܼƫŧi
		String line,rid="",url=null,headers="",host=null;
		String []  items;
		//��inputŪ�iheaders �íӧO�B�z�S��header
		while(true){
			line = input.readLine();
			if(line == null) break;//Ū�����X�j��
			items = line.split(": ");//Ūheader
			if(items[0].equals("requestId")){//����requestId
				rid = items[1];
				break;
			}else {
				headers += line + "\n";
			}
		}
		//���oURL
		lock.lock();
		url = MyMap.get(rid);//����URL
		if(url != null) host = url.split("/")[2];
		System.out.println("----------------");
        System.out.println("on # " + Thread.currentThread().getName());
		System.out.println("first try to get url");
		System.out.println("its rid             : " + rid);
		System.out.println("got url, its domain : " + host);
		while(url==null) {//������N�@����
			condition.await();//����䥦thread notify
			url = MyMap.get(rid);//�A���@��
			host = url.split("/")[2];
			System.out.println("----------------");//�L�X������W��
	        System.out.println("on # " + Thread.currentThread().getName());
			System.out.println("signaled, try to get url again");
			System.out.println("its rid             : " + rid);
			System.out.println("got url, its domain : " + host);
		}//����URL�A���X�j��
		lock.unlock();
		//���host domain
		items= headers.split("127.0.0.1:8000");;
		headers = items[0];
		for(int i = 1; i<items.length; i++) {
			headers = headers + host + items[i];
		}
		//�erequest��ؼк���
		//����������response
		//�Nresponse�e�^���s����
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
