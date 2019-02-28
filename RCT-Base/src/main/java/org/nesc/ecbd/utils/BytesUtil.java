package org.nesc.ecbd.utils;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;

/**
 * @author：Truman.P.Du
 * @createDate: 2018年4月20日 下午3:01:06
 * @version:1.0
 * @description:
 */
public class BytesUtil {
	/**
	 * 对象转数组
	 */
	public static byte[] toByteArray(Object obj) throws IOException {
		if (obj == null) {
			return null;
		}
		byte[] bytes = null;
		ByteArrayOutputStream bos = new ByteArrayOutputStream();
		ObjectOutputStream oos = new ObjectOutputStream(bos);
		oos.writeObject(obj);
		oos.flush();
		bytes = bos.toByteArray();
		oos.close();
		bos.close();
		return bytes;
	}

	/**
	 * 数组转对象
	 */
	public static Object toObject(byte[] bytes) throws IOException, ClassNotFoundException {
		if (bytes == null || bytes.length == 0) {
			return null;
		}
		Object obj = null;
		ByteArrayInputStream bis = new ByteArrayInputStream(bytes);
		ObjectInputStream ois = new ObjectInputStream(bis);
		obj = ois.readObject();
		ois.close();
		bis.close();
		return obj;
	}
}
