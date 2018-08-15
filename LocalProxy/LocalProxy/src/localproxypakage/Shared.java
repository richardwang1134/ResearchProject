package localproxypakage;

import java.util.HashSet;
import java.util.Set;
import java.util.concurrent.locks.Condition;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

public class Shared {
	final static Lock lock = new ReentrantLock();
	final static Condition condition = lock.newCondition();
	static Set<String> set = new HashSet<>();
}
