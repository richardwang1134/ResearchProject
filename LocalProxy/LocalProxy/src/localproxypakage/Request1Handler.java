package localproxypakage;

import java.io.IOException;
import java.io.OutputStream;
import java.util.List;
import java.util.Map;

import com.sun.net.httpserver.Headers;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

public class Request1Handler implements HttpHandler {

	@Override
	public void handle(HttpExchange ex) throws IOException {
		//format proccessing
		BrowserRequest request = new BrowserRequest(ex.getRequestURI().toString());
		Printer.print(request.id + " browser >> proxy   : request 1");
		//connect to server
		ServerConnection serverConnection = new ServerConnection(request.url);
		Printer.print(request.id + " proxy   >> server  : GET script request");
		//receive from server
		String body = serverConnection.getBody();
		Printer.print(request.id + " server  >> proxy   : response, for GET script request");
		//wait request 2
		try {	
			Shared.lock.lock();
			int i = 0;
			while(!Shared.set.contains(request.id)) {
				Printer.print(request.id + " proxy              : waiting for request2");
				Shared.condition.await();
				i++;
			}
			Shared.set.remove(request.id);
			Shared.lock.unlock();	
		} catch (InterruptedException e) {
			return;				
		}
		Printer.print(request.id + " proxy              : request 2 has arrived");
		//send response to browser
		ex.sendResponseHeaders(200, body.getBytes().length);
		OutputStream os = ex.getResponseBody();
        os.write(body.getBytes());
        os.close();
        Printer.print(request.id + " proxy >> browser   : response script, complete!");
	}
}