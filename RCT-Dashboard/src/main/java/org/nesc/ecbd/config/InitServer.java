package org.nesc.ecbd.config;


import java.util.List;

import org.nesc.ecbd.entity.RDBAnalyze;
import org.nesc.ecbd.entity.SlowlogEntity;
import org.nesc.ecbd.service.RDBAnalyzeService;
import org.nesc.ecbd.service.RDBScheduleJob;
import org.nesc.ecbd.service.ScheduleTaskService;
import org.nesc.ecbd.service.SlowlogScheduleJob;
import org.nesc.ecbd.service.SlowlogService;
import org.nesc.ecbd.utils.ElasticSearchUtil;
import org.quartz.SchedulerException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.http.client.ClientHttpRequestFactory;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

/**
 * @author：Truman.P.Du
 * @createDate: 2018年4月13日 下午2:00:16
 * @version:1.0
 * @description: 1. 默认启动后台进程，主要是为了新建进程，处理分析节点上报状态，避免出现状态数据出错 2. 初始化bean
 */
@Component
public class InitServer {
	 private static final Logger LOG = LoggerFactory.getLogger(InitServer.class);

	@Autowired
	InitConfig initConfig;
	
	@Autowired
	ScheduleTaskService scheduleTaskService;
	@Autowired
	SlowlogService slowlogService;
	@Autowired
	RDBAnalyzeService rdbAnalyzeService;

	
	public void init() {
		// 初始化ES工具类
		if(initConfig.isElasticsearchEnable()) {
			Integer requestTimeout = 10000;
			Integer socketTimeout = 10000;
			ElasticSearchUtil.init(requestTimeout, socketTimeout, initConfig.getEsUrls());
		}
		
		//启动定时任务
		initRDBJob();
		initSlowlogJob();
	}
	
	@Bean
	public RestTemplate buildRestTemplate() {
		return  new RestTemplate(simpleClientHttpRequestFactory());			
    }

	public ClientHttpRequestFactory simpleClientHttpRequestFactory() {
		SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
		factory.setReadTimeout(10000);
		factory.setConnectTimeout(15000);
		return factory;
	}
	
	public void initSlowlogJob() {
		List<SlowlogEntity> slowlogEntities = slowlogService.getTotals();
		for (SlowlogEntity entity : slowlogEntities) {
			try {
				if (entity.getAutoAnalyze()) {
					scheduleTaskService.addTask(entity, SlowlogScheduleJob.class);
				}
			} catch (SchedulerException e) {
				LOG.error("schedule job run faild!message:{}", e.getMessage());
			}
		}
	}
	
	public void initRDBJob() {
		List<RDBAnalyze> rdbAnalyzes = rdbAnalyzeService.list();
		for (RDBAnalyze rdbAnalyze : rdbAnalyzes) {
			try {
				if (rdbAnalyze.getAutoAnalyze()) {
					scheduleTaskService.addTask(rdbAnalyze, RDBScheduleJob.class);
				}
			} catch (SchedulerException e) {
				LOG.error("schedule job run faild!message:{}", e.getMessage());
			}
		}
	}
}
