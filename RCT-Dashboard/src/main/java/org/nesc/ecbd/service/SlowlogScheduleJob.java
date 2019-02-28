package org.nesc.ecbd.service;

import org.nesc.ecbd.entity.RedisInfo;
import org.nesc.ecbd.entity.SlowlogEntity;
import org.quartz.DisallowConcurrentExecution;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;

@DisallowConcurrentExecution
public class SlowlogScheduleJob implements Job {
	private static final Logger LOG = LoggerFactory.getLogger(SlowlogScheduleJob.class);
	@Autowired
	SlowlogService slowlogService;

	@Autowired
	RedisInfoService redisInfoService;
	@Autowired
	SlowlogCollectorSchedule slowlogCollectorSchedulel;

	@Override
	public void execute(JobExecutionContext context) throws JobExecutionException {
		SlowlogEntity entity = (SlowlogEntity) context.getJobDetail().getJobDataMap().get("slowscheduleJob");
		RedisInfo redisInfo = redisInfoService.selectById(entity.getPid());
		slowlogCollectorSchedulel.slowlogs(redisInfo);
		LOG.info("slowlog schedule is execute cron success,message:{}", entity.getSchedule());
	}
}
