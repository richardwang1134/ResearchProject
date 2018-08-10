package localproxypakage;

public class Printer {
	static void printThread(String s) {
		System.out.println("thread: "+Thread.currentThread().getId());
		System.out.println(s);
		System.out.println();
	}
	static void printException(String s,String m) {
		System.out.println("Exception:"+s);
		System.out.println("          "+m);
		System.out.println();
	}
	static void print(String s) {
		System.out.println(s);
		System.out.println();
	}
	static void printId(String s) {
		//System.out.println(s);
		//System.out.println();
	}
}
