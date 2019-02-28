package org.nesc.ecbd.common;

/**
 * @author：Truman.P.Du
 * @createDate: 2019年1月29日 上午10:01:18
 * @version:1.0
 * @description:
 */
public class BaseController {

	public RestResponse SUCCESS() {
		return new RestResponse();
	}

	public RestResponse SUCCESS(String message) {
		return new RestResponse(200, message);
	}

	public RestResponse SUCCESS_DATA(Object data) {
		return new RestResponse(200, null, data);
	}

	public RestResponse SUCCESS(String message, Object data) {
		return new RestResponse(200, message, data);
	}

	public RestResponse ERROR(String message) {
		return new RestResponse(500, message);
	}
}
