package org.nesc.ecbd;

import org.nesc.ecbd.config.InitServer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeansException;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.server.EnableEurekaServer;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * @author：Truman.P.Du
 * @createDate: 2018年3月21日 下午3:59:19
 * @version:1.0
 * @description: 程序入口
 */
@SpringBootApplication
@EnableEurekaServer
@EnableScheduling
public class StartApp implements ApplicationContextAware {
	private final static Logger LOG = LoggerFactory.getLogger(StartApp.class);
	private static  ApplicationContext appContext = null;
	public static void main(String[] args) {
		SpringApplication.run(StartApp.class, args);
		InitServer initServer  = (InitServer) appContext.getBean("initServer");
		initServer.init();

		LOG.info("RCT dashboard sevice start success!");
	}

	@Override
	public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {
		if(appContext  == null) {
			appContext =  applicationContext;
		}

		
	}
}
