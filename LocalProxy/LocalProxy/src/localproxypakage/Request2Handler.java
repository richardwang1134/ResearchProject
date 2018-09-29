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
		//wait request 1
		String bodyCheck = "";
		try {	
			Shared.lock.lock();
			while(true) {
				if(Shared.set.contains(request.id + "fail")) {
					bodyCheck = "fail";
					break;
				}else if(Shared.set.contains(request.id + "pass")) {
					bodyCheck = "pass";
					break;
				}else {
					Shared.condition.await();
				}
			}
			Shared.set.remove(request.id+bodyCheck);
			Shared.lock.unlock();	
		} catch (InterruptedException e) {
			return;				
		}
		//send response to browser
		Printer.print(request.id + " proxy >> browser   : response checking result : "+bodyCheck);
		ex.sendResponseHeaders(200, bodyCheck.getBytes().length);
		OutputStream os = ex.getResponseBody();
        os.write(bodyCheck.getBytes());
        os.close();
	}
	private void signal(String id){
		Shared.lock.lock();
		Shared.set.add(id);
		Shared.condition.signalAll();
		Shared.lock.unlock();
	}

}