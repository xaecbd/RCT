package org.nesc.ecbd.service;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.apache.commons.lang3.StringUtils;
import org.nesc.ecbd.config.InitConfig;
import org.nesc.ecbd.entity.RedisInfo;
import org.nesc.ecbd.utils.ElasticSearchUtil;
import org.nesc.ecbd.utils.RedisUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.alibaba.fastjson.JSONObject;

import redis.clients.jedis.util.Slowlog;

/**
 * @author：Truman.P.Du
 * @createDate: 2018年4月13日 下午4:39:10
 * @version:1.0
 * @description:
 */
@Service
public class SlowlogCollectorSchedule {
    private static final Logger LOG = LoggerFactory.getLogger(SlowlogCollectorSchedule.class);
    @Autowired
    InitConfig initConfig;

    public static Map<String, Long> lastToESTimes = new HashMap<>();
    /**
     * 正在执行job 列表，对应一个clusterID ,一个ccheduleID 用该变量控制取消job
     */
    public static Map<Long, Long> activeJob = new HashMap<>();


    public void removeJob(RedisInfo redisInfo) {
        activeJob.remove(redisInfo.getId());
    }   
    
    public void slowlogs(RedisInfo redisInfo) {
        String redisHost = redisInfo.getAddress().split(":")[0];
        String port = redisInfo.getAddress().split(":")[1];
        Map<String, List<Slowlog>> mapSlowlog = null;
        RedisUtil redisUtil = null;
        try {
        	if(StringUtils.isNotBlank(redisInfo.getPassword())) {
				redisUtil = new RedisUtil(redisHost, Integer.parseInt(port),redisInfo.getPassword());
			}else {
				redisUtil = new RedisUtil(redisHost, Integer.parseInt(port));
			}
            mapSlowlog = redisUtil.slowlogs();
        } catch (Exception e) {
            LOG.error("RedisUtil operation error. ", e);
        } finally {
            if (redisUtil != null) {
            	redisUtil.close();
            }
        }
        slowlogToES(mapSlowlog, redisInfo.getName());
    }
    /**
     * 将slowlog 数据写入ES中，保存最后提交时间
     * 
     * @param mapSlowlog
     * @param clusterName
     */
    public void slowlogToES(Map<String, List<Slowlog>> mapSlowlog, String clusterName) {
        long SendTime = System.currentTimeMillis();
        if (mapSlowlog == null || mapSlowlog.size() <= 0) {
        	 return;
        }           
        Set<JSONObject> documents = new HashSet<>();
        for (String key : mapSlowlog.keySet()) {
            List<Slowlog> slowlogs = mapSlowlog.get(key);
            String host = key.split(":")[0];
            String port = key.split(":")[1];           
            for (int i = 0; i < slowlogs.size(); i++) {
                Slowlog slowlog = slowlogs.get(i);
                JSONObject json = new JSONObject();
                Long lastTime = lastToESTimes.get(key);

                // 小于缓存时间就不发送
                if (lastTime != null && slowlog.getTimeStamp() <= lastTime) {
                    continue;
                }
                
                json.put("ClusterName", clusterName);
                json.put("RedisInstance", key);
                json.put("ExecutionTime", slowlog.getExecutionTime());
                json.put("TimeStamp", slowlog.getTimeStamp() * 1000); // 改为毫秒级别 TimeStamp
                // 构建唯一ID，防止数据写入多次
                json.put("id", host + port + slowlog.getId());
                List<String> args = slowlog.getArgs();
                if (args != null && args.size() > 1) {
                    json.put("Command", args.get(0));
                    json.put("Key", args.get(1));
                    json.put("Args", JSONObject.toJSONString(args));
                }
                json.put("SendTime", SendTime);            
                documents.add(json);
            }
           
            // 存储最新提交时间，便于后期不往ES中推数据
            if (slowlogs != null && slowlogs.size() > 0) {
                lastToESTimes.put(key, slowlogs.get(0).getTimeStamp());
            }
        }
      //  System.out.println("documents:"+documents.size());
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
        String index = initConfig.getSlowlogIndexName() + "-" + sdf.format(new Date());
        try {
            if (documents.size() <= 0) {
            	  return;
            }      
            if(initConfig.isElasticsearchEnable()) {
            	 ElasticSearchUtil.bulkIndexDocumentByID(index, "rct-slowlog", documents);  
            }
                   
        } catch (Exception e) {
            LOG.error("slowlogToES error .", e);
        }
    }
}
