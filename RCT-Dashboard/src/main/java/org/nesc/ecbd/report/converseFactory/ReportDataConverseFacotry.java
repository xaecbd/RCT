package org.nesc.ecbd.report.converseFactory;

import org.nesc.ecbd.entity.AnalyzerConstant;
import org.nesc.ecbd.report.IAnalyzeDataConverse;
import org.nesc.ecbd.report.impl.DataTypeDataConverse;
import org.nesc.ecbd.report.impl.PrefixDataConverse;
import org.nesc.ecbd.report.impl.TTLDataConverse;
import org.nesc.ecbd.report.impl.TopKeyDataConverse;

/**
 * @author kz37
 * @date 2018/10/23
 */
public class ReportDataConverseFacotry {

	public static IAnalyzeDataConverse getReportDataConverse(String analyzerType) {
		int type = Integer.parseInt(analyzerType);

		if (AnalyzerConstant.DATA_TYPE_ANALYZER == type) {
			return new DataTypeDataConverse();
		} else if (AnalyzerConstant.PREFIX_ANALYZER == type) {
			return new PrefixDataConverse();
		} else if (AnalyzerConstant.TOP_KEY_ANALYZER == type) {
			return new TopKeyDataConverse();
		} else if (AnalyzerConstant.TTL_ANALYZER == type) {
			return new TTLDataConverse();
		} else {
			return null;
		}
	}
}
