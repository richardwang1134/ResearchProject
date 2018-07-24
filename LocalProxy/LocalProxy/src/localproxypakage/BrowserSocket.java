package localproxypakage;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.net.Socket;

public class BrowserSocket {
	private Socket socket;
	private BufferedReader bufferedReader;
	private BufferedWriter bufferedWriter;
	String id  = null;
	String url = null;

	public BrowserSocket(Socket socket) throws IOException {
		this.socket = socket;
		socket.setSoTimeout(3000);
		bufferedReader = new BufferedReader(new InputStreamReader(socket.getInputStream()));
		bufferedWriter = new BufferedWriter(new OutputStreamWriter(socket.getOutputStream(), "UTF8"));
	}
	public BrowserRequest receive(){
		BrowserRequest browserRequest = new BrowserRequest();
		String line = "line";
		int beginIndex,endIndex;
		try {
			while(line!=null && !line.equals("")) {				
				line = bufferedReader.readLine();
				Printer.printThread(line);
				if(line.contains("/request1")) {
					browserRequest.type = "1";
					beginIndex = line.indexOf("/request1")+10;
					endIndex = line.indexOf("/",beginIndex);
					if(beginIndex>0 && endIndex >0) {
						browserRequest.id = line.substring(beginIndex,endIndex);
					}
					beginIndex = line.indexOf("/",endIndex)+1;
					endIndex = line.indexOf(" ",beginIndex);
					if(beginIndex>0 && endIndex >0) {
						browserRequest.url = line.substring(beginIndex,endIndex);
					}
					break;
				}else if(line.contains("/request2")){
					browserRequest.type = "2";
					beginIndex = line.indexOf("/request2")+10;
					endIndex = line.indexOf(" ",beginIndex);
					if(beginIndex>0 && endIndex >0) {
						browserRequest.id = line.substring(beginIndex,endIndex);
					}
				}
			}
			return browserRequest;
		}catch(Exception e) {	
			Printer.printException("BrowserSocket.receive", e.getMessage());
			return null;
		}
	}
	public void sendHeader(String header) throws IOException {
		bufferedWriter.write(header);
	}
	public void sendBody(BufferedReader bufferedReader) throws IOException {
		String line;
		while(true) {
			line = bufferedReader.readLine();
			if(line==null) break;
			bufferedWriter.write(line + "\r\n");
		}
		bufferedWriter.write("\r\n");
		bufferedWriter.close();
	}

	@SuppressWarnings({ "resource", "null" })
	public void sendChunkedBody(BufferedReader bufferedReader){
		try {
			String line;
			while(true) {
				line = bufferedReader.readLine();
				if(line==null) break;
				bufferedWriter.write(
					Integer.toHexString(line.length()+2) + "\r\n"
					+ line + "\r\n"
					+ "\r\n");
			}
			bufferedWriter.write("0\r\n\r\n");
			bufferedWriter.close();
		}catch(Exception e) {
			Printer.printException("BrowserSocket.sendChunkedBody", e.getMessage());
		}
		
	}

	public void close() throws IOException {
		socket.close();
	}

}
