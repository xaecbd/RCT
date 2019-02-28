package org.nesc.ecbd.service;

import org.nesc.ecbd.entity.RDBAnalyze;
import org.quartz.DisallowConcurrentExecution;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;

import com.alibaba.fastjson.JSONObject;

@DisallowConcurrentExecution
public class RDBScheduleJob implements Job {

	private static final Logger LOG = LoggerFactory.getLogger(RDBScheduleJob.class);

	@Autowired
	RDBAnalyzeService rdbAnalyzeService;

	@Override
	public void execute(JobExecutionContext context) throws JobExecutionException {
		RDBAnalyze rdbAnalyze = (RDBAnalyze) context.getJobDetail().getJobDataMap().get("rdbAnalyzeJob");
		
		int[] strings = null;
		if (rdbAnalyze.getAnalyzer().contains(",")) {
			String[] str = rdbAnalyze.getAnalyzer().split(",");
			strings = new int[str.length];
			for (int i = 0; i < str.length; i++) {
				strings[i] = Integer.parseInt(str[i]);
			}
		} else {
			strings = new int[1];
			strings[0] = Integer.parseInt(rdbAnalyze.getAnalyzer());
		}
		JSONObject status = rdbAnalyzeService.allocationRDBAnalyzeJob(rdbAnalyze.getId(), strings);
		LOG.info("cron :{}", rdbAnalyze.getSchedule());
		if ((boolean) status.get("status")) {
			LOG.info("cron success,message:{}", status.get("message"));
		} else {
			LOG.warn("cron faild!,message:{}", status.get("message"));
		}

	}


}
