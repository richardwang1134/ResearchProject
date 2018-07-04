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
					String url = getFromMap(browserRequest.id);
					Printer.printThread(browserRequest.id+" get "+url);
					ServerSocket serverSocket = new ServerSocket(url);
					browserSocket.sendHeader(serverSocket.head);
					if(serverSocket.responseIsChunked) {
						browserSocket.sendChunkedBody(serverSocket.bufferedReader);
					}else {
						browserSocket.sendBody(serverSocket.bufferedReader);
					}
					break;
				case "2":
					setToMap(browserRequest.id,browserRequest.url);
					Printer.printThread(browserRequest.id+" set "+browserRequest.url);
					browserSocket.sendHeader("HTTP/1.0 200 OK\r\n");
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
	private void setToMap(String id, String url) {
		if(id!=null && url!=null) {
			lock.lock();
			MyMap.set(id, url);
			condition.signalAll();
			lock.unlock();
		}
	}
	private String getFromMap(String id) throws InterruptedException {
		String url = null;
		if(id != null) {
			lock.lock();			
			url = MyMap.get(id);
			while(url == null) {
				condition.await();
				url = MyMap.get(id);
			}
			MyMap.del(id);
			lock.unlock();
		}
		return url;
	}
}

