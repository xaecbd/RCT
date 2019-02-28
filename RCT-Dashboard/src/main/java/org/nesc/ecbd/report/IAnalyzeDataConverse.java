package org.nesc.ecbd.report;


import java.util.*;

import org.nesc.ecbd.entity.ExcelData;
import org.nesc.ecbd.entity.ReportData;

/** 
 *@author kz37
 *@date 2018/10/19
 */
public interface IAnalyzeDataConverse {


    String PREFIX_KEY_BY_COUNT = "PrefixKeyByCount";

    String PREFIX_KEY_BY_MEMORY = "PrefixKeyByMemory";

    String DATA_TYPE_ANALYZE = "DataTypeAnalyze";

    String TOP_KEY_ANALYZE= "TopKeyAnalyze";

    String TTL_ANALYZE = "TTLAnalyze";


    /**
     * 在Excel中从第几列开始写
     */
    int TOP_KEY_STRING_DATA = 0;
    int TOP_KEY_HASH_DATA = 5;
    int TOP_KEY_LIST_DATA = 10;
    int TOP_KEY_SET_DATA = 15;

    Map<String, List<ExcelData>> getPrefixAnalyzerData(Set<String> newSetData, Map<String, ReportData> latestPrefixData);

    Map<String, String> getMapJsonString(Set<String> newSetData);

}
