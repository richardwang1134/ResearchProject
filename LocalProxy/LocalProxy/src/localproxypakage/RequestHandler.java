package localproxypakage;

import java.io.BufferedWriter;
import java.io.IOException;
import java.io.OutputStream;
import java.io.OutputStreamWriter;


import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpsExchange;

public class RequestHandler implements HttpHandler {

	@Override
	public void handle(HttpExchange httpExchange) throws IOException {
		HttpsExchange httpsExchange = (HttpsExchange) httpExchange;
		String response = "This is the response";
		httpExchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
		httpExchange.sendResponseHeaders(200, response.getBytes().length);
		OutputStream os = httpExchange.getResponseBody();
        os.write(response.getBytes());
        os.close();
	}

}
