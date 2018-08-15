package localproxypakage;

import java.io.IOException;
import java.io.OutputStream;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpsExchange;

public class Request2Handler implements HttpHandler {

	@Override
	public void handle(HttpExchange ex) throws IOException {
		//format proccessing
		BrowserRequest request = new BrowserRequest(ex.getRequestURI().toString());
		Printer.print(request.id + " browser >> proxy   : request 2");
		//signal request 1
		signal(request.id);	
		//send response to browser
		ex.sendResponseHeaders(200, "Signal successed".getBytes().length);
		OutputStream os = ex.getResponseBody();
        os.write("Signal successed".getBytes());
        os.close();
	}
	private void signal(String id){
		Shared.lock.lock();
		Shared.set.add(id);
		Shared.condition.signalAll();
		Shared.lock.unlock();
	}

}