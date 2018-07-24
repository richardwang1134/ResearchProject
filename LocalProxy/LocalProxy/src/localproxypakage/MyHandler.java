package localproxypakage;

import java.io.IOException;
import java.net.Socket;
import java.util.concurrent.locks.Condition;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

public class MyHandler implements Runnable {
	
	final static Lock lock = new ReentrantLock();
	final static Condition condition = lock.newCondition();
	private Socket socket;
	private BrowserSocket browserSocket;
	private BrowserRequest browserRequest;
	
	public MyHandler(Socket socket) throws IOException {
		this.socket = socket;
	}
	
	@Override 
	public void run() {
		if(checkClientIP()==false) return;
		try {
			browserSocket = new BrowserSocket(socket);
			browserRequest = browserSocket.receive();
			switch (browserRequest.type) {
				case "1":
					Printer.print(browserRequest.id + " browser >> proxy   : request 1");
					ServerConnection serverConnection = new ServerConnection(browserRequest.url);
					Printer.print(browserRequest.id + " proxy   >> server  : GET script request");
					ServerResponse serverResponse = serverConnection.getResponse();
					Printer.print(browserRequest.id + " server  >> proxy   : response, for GET script request");
					wait(browserRequest.id);
					browserSocket.sendHeader(serverResponse.head);
					if(serverResponse.isChunked) {
						Printer.print(browserRequest.id + " proxy   >> browser : chunked script response, for request 1");
						browserSocket.sendChunkedBody(serverResponse.bufferedReader);
					}else {
						Printer.print(browserRequest.id + " proxy   >> browser : script response, for request 1");
						browserSocket.sendBody(serverResponse.bufferedReader);
					}
					browserSocket.close();
					Printer.print(browserRequest.id + " Complete!");
					break;
				case "2":
					Printer.print(browserRequest.id + " browser >> proxy   : request 2");
					signal(browserRequest.id);
					Printer.print(browserRequest.id + " proxy   >> browser : 200 OK empty response, for request 2");
					browserSocket.sendHeader("HTTP/1.1 200 OK\r\nContent-Length:7\r\n\r\nnothing\r\n\r\n");
					browserSocket.close();
					break;
				default:
					break;
			}
			return; 
		} catch (Exception e) {
			System.out.println("Exception: MyHandler.run");
			System.out.println(e.getMessage());
			return;   
		} 
	}
	private boolean checkClientIP(){
		String ip = socket.getRemoteSocketAddress().toString().split(":")[0];
		if(ip.equals("/127.0.0.1")) return true;
		else		return false;	
	}
	private void wait(String id) throws InterruptedException {
		lock.lock();
		Printer.printId(id+" waiting");
		while(!BlockingIDs.contains(browserRequest.id)) condition.await();
		Printer.printId(id + " removed");
		BlockingIDs.remove(browserRequest.id);
		lock.unlock();
	}
	private void signal(String id) throws InterruptedException {
		lock.lock();
		BlockingIDs.add(browserRequest.id);
		Printer.printId(id + " signaled");
		condition.signalAll();
		lock.unlock();
	}
}

