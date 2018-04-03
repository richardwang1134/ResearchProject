package serverpakage;

import java.net.ServerSocket;
import java.net.Socket;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class Server {
	public static void main(String[] args) throws Exception {
		ExecutorService executor = Executors.newCachedThreadPool();
        ServerSocket listener = new ServerSocket(8000,50);
        System.out.println("Waiting for Connecting...");
        while(true) {
            Socket socket = listener.accept();
            RequestHandler requestHandler = new RequestHandler(socket);
            executor.execute(requestHandler);
        }
    }
}

/* CODE TRASH CAN

private void processRequest(Socket serverSocket) throws IOException {
		String line;
		System.out.println("----------------");
		String threadName = Thread.currentThread().getName();
        System.out.println("on # " + threadName);
		BufferedReader input = new BufferedReader(new InputStreamReader(serverSocket.getInputStream()));
        while(true) {
        	line = input.readLine();
        	System.out.println(line);
        	if(line == null) break;
        }
	}

DataOutputStream outToClient = new DataOutputStream(serverSocket.getOutputStream());
outToClient.writeBytes("HTTP/1.0 200 OK\r\n");
outToClient.writeBytes("Content-Type: text/html\r\n");
outToClient.writeBytes("\r\n");
outToClient.writeBytes("<H1>Welcome to the Java WebServer</H1>\r\n");
System.out.println("Complete...");
serverSocket.close();
outToClient.flush();

*/