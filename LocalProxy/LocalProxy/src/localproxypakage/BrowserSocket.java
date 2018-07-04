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
	public String id  = null;
	public String url = null;
	public String requestType  = null;
	public String head  = "";

	public BrowserSocket(Socket socket) throws IOException {
		this.socket = socket;
		socket.setSoTimeout(3000);
		bufferedReader = new BufferedReader(new InputStreamReader(socket.getInputStream()));
		bufferedWriter = new BufferedWriter(new OutputStreamWriter(socket.getOutputStream(), "UTF8"));
	}
	public BrowserRequest receive(){
		BrowserRequest browserRequst = new BrowserRequest();
		String line = "line";
		int beginIndex,endIndex;
		try {
			while(line!=null && !line.equals("")) {				
				line = bufferedReader.readLine();
				endIndex = line.indexOf(": ");
				beginIndex = endIndex+2;
				if(beginIndex>0 && endIndex >0) {
					if(line.substring(0,endIndex).equals("requestId")) {
						browserRequst.id = line.substring(beginIndex);
					}else if(line.substring(0,endIndex).equals("originalURL")) {
						browserRequst.url = line.substring(beginIndex);
					}
				}
				beginIndex = line.indexOf(" ")+1;
				endIndex = line.indexOf(" ",beginIndex);
				if(beginIndex>0 && endIndex >0) {
					if(line.substring(beginIndex,endIndex).equals("/browserRequest1")) {
						browserRequst.type = "1";
					}else if(line.substring(beginIndex,endIndex).equals("/browserRequest2")){
						browserRequst.type = "2";
					}
				}
			}
			return browserRequst;
		}catch(Exception e) {	
			Printer.printException("BrowserSocket.receive", e.getMessage());
			return null;
		}
	}
	public void sendHeader(String header) throws IOException {
		bufferedWriter.write(header);
	}

	public void sendBody(BufferedReader bufferedReader) throws IOException {
		String buffer;
		while((buffer = bufferedReader.readLine())!=null) {
			bufferedWriter.write(buffer+"\r\n");
		}
	}

	@SuppressWarnings({ "resource", "null" })
	public void sendChunkedBody(BufferedReader bufferedReader){
		try {
			File file=new File("log.txt");
			FileWriter fileWriter = new FileWriter(file);
			String line = "";
			//bufferedWriter.write("11\r\n/*start*/\r\n\r\n");
			while(true) {
				line = bufferedReader.readLine();
				if(line==null) break;
				bufferedWriter.write(
					Integer.toHexString(line.length()+2) + "\r\n"
					+ line + "\r\n"
					+ "\r\n");
				fileWriter.write(
					Integer.toHexString(line.length()+2) + "\r\n"
					+ line + "\r\n"
					+ "\r\n");
			}
			bufferedWriter.write("0\r\n\r\n");
			bufferedWriter.close();
			fileWriter.close();
		}catch(Exception e) {
			Printer.printException("BrowserSocket.sendChunkedBody", e.getMessage());
		}
		
	}

	public void close() throws IOException {
		socket.close();
	}

}
