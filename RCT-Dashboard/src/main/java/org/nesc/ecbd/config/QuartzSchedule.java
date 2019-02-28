package org.nesc.ecbd.config;

import java.io.IOException;

import org.nesc.ecbd.common.JobFactory;
import org.nesc.ecbd.service.RDBScheduleJob;
import org.nesc.ecbd.service.SlowlogScheduleJob;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.quartz.JobDetailFactoryBean;
import org.springframework.scheduling.quartz.SchedulerFactoryBean;

/**
 * @author：Truman.P.Du
 * @createDate: 2019年1月30日 下午4:39:12
 * @version:1.0
 * @description:
 */

@Configuration
public class QuartzSchedule {

	@Autowired
	private JobFactory jobFactory;

	@Bean(name = "schedulerFactoryBean")
	public SchedulerFactoryBean schedulerFactoryBean() throws IOException {
		SchedulerFactoryBean factory = new SchedulerFactoryBean();
		factory.setOverwriteExistingJobs(true);
		// 延时启动
		factory.setStartupDelay(20);
		// 自定义Job Factory，用于Spring注入
		factory.setJobFactory(jobFactory);
		return factory;
	}

	@Bean(name = "slowlogScheduleJob")
	public JobDetailFactoryBean slowlogScheduleJob() {
		JobDetailFactoryBean jobDetail = new JobDetailFactoryBean();
		jobDetail.setJobClass(SlowlogScheduleJob.class);
		return jobDetail;
	}
	
	@Bean(name = "rdbScheduleJob")
	public JobDetailFactoryBean rdbScheduleJob() {
		JobDetailFactoryBean jobDetail = new JobDetailFactoryBean();
		jobDetail.setJobClass(RDBScheduleJob.class);
		return jobDetail;
	}
}
