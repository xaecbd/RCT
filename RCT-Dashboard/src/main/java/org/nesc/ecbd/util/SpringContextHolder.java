package org.nesc.ecbd.util;

import org.springframework.context.ApplicationContext;

public class SpringContextHolder {
    private static ApplicationContext context;

	public static ApplicationContext getContext() {
		return context;
	}

	public static void setContext(ApplicationContext context) {
		SpringContextHolder.context = context;
	}

}
