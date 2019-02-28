/**
 * 
 */
package org.nesc.ecbd.test;

import java.util.HashMap;
import java.util.Map;

import org.nesc.ecbd.utils.RedisUtil;

/**
 * @author Hulva Luva.H
 * @since 2018年3月31日
 *
 */
public class RedisDataTypeTest {
  @SuppressWarnings("resource")
public static void main(String[] args) {
    Map<String, String> testMap = new HashMap<>();
    testMap.put("test", "dada");
    testMap.put("test1", "dada");
    Map<String, Double> testZset = new HashMap<>();
    testZset.put("dsadsa", 20D);
    testZset.put("dsadsa", 200D);
    testZset.put("weqewq", 20D);
    RedisUtil redisUtil = new RedisUtil("192.168.0.1", 9000);
//    redisUtil.jc.set("luvatest:string", "blabla");
//    redisUtil.jc.setex("luvatest:string_with_ttl", 36000, "dsdasds");
//    redisUtil.jc.hset("luvatest:hash", "field0", "value");
//    redisUtil.jc.hset("luvatest:hash", "field1", "value");
//    redisUtil.jc.hmset("luvatest:map", testMap);
//    redisUtil.jc.lpush("luvatest:list", "1", "2", "3");
//    redisUtil.jc.zadd("luvatest:zset", testZset);
//    redisUtil.jc.zadd("luvatest:zset", 1, "hello zset");
    System.out.println(redisUtil.jc.getClusterNodes());
    
  }
}
