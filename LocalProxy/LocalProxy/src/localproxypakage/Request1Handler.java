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
		String bodyCheck = (
				body.contains("window.location.replace")||
				body.contains("window.location.href")||
				body.contains("document.location.replace")||
				body.contains("document.location.href")
				) ? "fail" : "pass";
		Printer.print(request.id + " server  >> proxy   : response of GET script request");
		Printer.print(request.id + " proxy              : script checking ... " + bodyCheck);
		//wait request 2
		try {	
			Shared.lock.lock();
			while(!Shared.set.contains(request.id)) {
				Printer.print(request.id + " proxy              : waiting for request2");
				Shared.condition.await();
			}
			Shared.set.remove(request.id);
			Shared.set.add(request.id + bodyCheck);
			Shared.condition.signalAll();
			Shared.lock.unlock();	
		} catch (InterruptedException e) {
			return;				
		}
		//send response to browser
		ex.sendResponseHeaders(200, body.getBytes().length);
		OutputStream os = ex.getResponseBody();
        os.write(body.getBytes());
        os.close();
        Printer.print(request.id + " proxy >> browser   : request 2 has arrived, response script");
	}
}