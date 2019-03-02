package org.nesc.ecbd;

import redis.clients.jedis.Jedis;

/**
 * @author：Truman.P.Du
 * @createDate: 2018年3月30日 上午7:49:48
 * @version:1.0
 * @description:
 */

public class RedisTest {

	public static void main(String[] args) throws Exception {
		Jedis jedis = new Jedis("192.168.0.1", 6379);
		Long m1 = Long.valueOf(getMemory(jedis));
		insertData(jedis);
		Long m2 = Long.valueOf(getMemory(jedis));
		System.out.println(m2 - m1);
	}

	public static void insertData(Jedis jedis) {
		for (int i = 10000; i < 100000; i++) {
			jedis.set( "aa"+i,  "bb"+i); // key和value长度都是7字节，且不是整数
		}
	}

	public static String getMemory(Jedis jedis) {
		String memoryAllLine = jedis.info("memory");
		String usedMemoryLine = memoryAllLine.split("\r\n")[1];
		String memory = usedMemoryLine.substring(usedMemoryLine.indexOf(':') + 1);
		return memory;
	}
}
