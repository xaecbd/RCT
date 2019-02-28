package org.nesc.ecbd.util;

import java.io.File;

import org.apache.commons.lang3.StringUtils;

import com.google.common.io.Files;

/**
 * @author kz37
 * @date 2018/10/19
 */
public class FileUtil {
	public static void copyFile(String source, String dest) throws Exception {
		if (StringUtils.isBlank(source) || StringUtils.isBlank(dest)) {
			throw new Exception("source or dest must not blank.");
		}
		File sourceFile = new File(source);
		File destFile = new File(dest);
		if (!destFile.exists()) {
			destFile.getParentFile().mkdirs();
		}
		Files.copy(sourceFile, destFile);
	}
}
