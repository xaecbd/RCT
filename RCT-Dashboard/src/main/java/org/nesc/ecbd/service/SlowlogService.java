package org.nesc.ecbd.service;

import java.sql.Date;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang3.StringUtils;
import org.nesc.ecbd.entity.RedisInfo;
import org.nesc.ecbd.entity.SlowlogEntity;
import org.nesc.ecbd.mapper.SlowlogMapper;
import org.nesc.ecbd.utils.RedisUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.alibaba.fastjson.JSONObject;

import redis.clients.jedis.util.Slowlog;

@Service
public class SlowlogService {
	private static final Logger LOG = LoggerFactory.getLogger(SlowlogService.class);
	@Autowired
	SlowlogMapper slowlogMapper;
	@Autowired
	RedisInfoService redisInfoService;
	@Autowired
	ScheduleTaskService taskService;

	public List<SlowlogEntity> getTotals() {
		return slowlogMapper.selectList(null);
	}

	public boolean insert(SlowlogEntity slowlogEntity) {
		int result = 0;
		SlowlogEntity slowlogEntity2 = null;
		try {
		//	slowlogEntity2 = slowlogMapper.getSlowlogByPid(slowlogEntity.getPid());
			Long id = slowlogMapper.getSlowlogByPid(slowlogEntity.getPid());
			slowlogEntity2 = slowlogMapper.selectById(id);
			if (slowlogEntity2 == null) {
				result = slowlogMapper.insert(slowlogEntity);
			} else {
				slowlogEntity.setId(slowlogEntity2.getId());
				result = slowlogMapper.updateById(slowlogEntity);
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
		return checkResult(result);
	}

	public SlowlogEntity selectById(Long id) {
		return slowlogMapper.selectById(id);
	}

	public boolean delete(Long id) {
		int result = slowlogMapper.deleteById(id);
		return checkResult(result);
	}

	public boolean update(SlowlogEntity slowlogEntity) {
		int result = slowlogMapper.updateById(slowlogEntity);
		return checkResult(result);
	}

	public boolean checkResult(int result) {
		if (result > 0) {
			return true;
		} else {
			return false;
		}
	}

	public String slowlogStatistic(Long pid) {
		RedisInfo redisInfo = redisInfoService.selectById(pid);
		String redisHost = redisInfo.getAddress().split(":")[0];
		String port = redisInfo.getAddress().split(":")[1];
		JSONObject result = new JSONObject();
		RedisUtil redisUtil = null;
		try {
			if (StringUtils.isNotBlank(redisInfo.getPassword())) {
				redisUtil = new RedisUtil(redisHost, Integer.parseInt(port), redisInfo.getPassword());
			} else {
				redisUtil = new RedisUtil(redisHost, Integer.parseInt(port));
			}
			Map<String, List<Slowlog>> mapSlowlog = redisUtil.slowlogs();

			// 按命令统计(commond:count)statictic by command
			Map<String, Integer> keyStatistics = new HashMap<>();
			for (String host : mapSlowlog.keySet()) {
				List<Slowlog> slowlogs = mapSlowlog.get(host);
				if (slowlogs.size() <= 0) {
					continue;
				}
				for (Slowlog slowlog : slowlogs) {
					if (slowlog.getArgs() == null || slowlog.getArgs().size() <= 0) {
						continue;
					}
					if (keyStatistics.containsKey(slowlog.getArgs().get(0))) {
						Integer count = keyStatistics.get(slowlog.getArgs().get(0));
						keyStatistics.put(slowlog.getArgs().get(0), (1 + count));
					} else {
						keyStatistics.put(slowlog.getArgs().get(0), 1);
					}
				}
			}
			// 按命令统计
			JSONObject commondsStatistics = new JSONObject();
			for (String command : keyStatistics.keySet()) {
				commondsStatistics.put(command, keyStatistics.get(command));
			}
			result.put("commondsStatisticsObj", commondsStatistics);
		} catch (Exception e) {
			LOG.error("slowlog has error.", e);
		} finally {
			if (redisUtil != null) {
				redisUtil.close();
			}
		}
		return result.toJSONString();
	}

	public Map<String, List<Slowlog>> getSlowlog(Long id) {
		RedisUtil redisUtil = null;
		Map<String, List<Slowlog>> result = null;
		try {
			RedisInfo redisInfo = redisInfoService.selectById(id);
			String redisHost = redisInfo.getAddress().split(":")[0];
			String port = redisInfo.getAddress().split(":")[1];
			if (StringUtils.isNotBlank(redisInfo.getPassword())) {
				redisUtil = new RedisUtil(redisHost, Integer.parseInt(port), redisInfo.getPassword());
			} else {
				redisUtil = new RedisUtil(redisHost, Integer.parseInt(port));
			}
			result = redisUtil.slowlogs();
		} catch (Exception e) {
			LOG.error("slow has error.", e);
		} finally {
			if (redisUtil != null) {
				redisUtil.close();
			}
		}
		return result;
	}

	public List<Map<String, Object>> slowlogSearch(String id,String hosts) {
		List<Map<String, Object>> results = new ArrayList<Map<String, Object>>();
		DateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm");		
		Map<String, List<Slowlog>> slowlist = this.getSlowlog(Long.valueOf(id));		
	    slowlist.forEach((host,slowLists)->{
	    	List<Slowlog> slowlog = null;
	    	if(!"".equals(hosts) && null != hosts) {
	    		if(host.equalsIgnoreCase(hosts)) {
	    			slowlog = slowlist.get(host);
	    		}else {	    			
	    		   return;	
	    		}
	    	}else {
	    		slowlog = slowlist.get(host);
	    	}
	    	slowlog.forEach(slow->{
	    		Map<String, Object> maps = new HashMap<String, Object>();
	    		maps.put("host", host);
	    		Date date = new Date(slow.getTimeStamp()*1000);
				maps.put("SlowDate", sdf.format(date));
				maps.put("type", slow.getArgs().get(0));
				maps.put("command", slow.getArgs().toString());
				maps.put("runTime", String.valueOf(slow.getExecutionTime()));
				results.add(maps);
	    	});
	    });
		return results;
	}

	public SlowlogEntity searchSlowlogJob(Long pid) {
		Long id =  slowlogMapper.getSlowlogByPid(pid);
		return slowlogMapper.selectById(id);
	}
}
