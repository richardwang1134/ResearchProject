package localproxypakage;

import java.net.ServerSocket;
import java.net.Socket;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class LocalProxy {
	@SuppressWarnings("resource")
	public static void main(String[] args) throws Exception {
		ExecutorService executor = Executors.newCachedThreadPool();
        ServerSocket listener = new ServerSocket(8000,10);
        System.out.println("Waiting for Connecting...");
        while(true) {
            Socket socket = listener.accept();
            MyHandler handler = new MyHandler(socket);
            executor.execute(handler);
        }
    }
}