package org.nesc.ecbd.util;

import org.junit.Test;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static org.junit.Assert.assertEquals;

public class BytesConverseUtilTest {

    @Test
    public void testGetSize(){
        assertEquals("0B", BytesConverseUtil.getSize(-2000L));
        assertEquals("0B", BytesConverseUtil.getSize(0L));
        assertEquals("50B", BytesConverseUtil.getSize(50L));
        assertEquals("2.1KB", BytesConverseUtil.getSize(2100L));
        assertEquals("4.9MB", BytesConverseUtil.getSize(5100000L));
        assertEquals("9.1GB", BytesConverseUtil.getSize(9800000000L));
    }

    @Test
    public void testConverseBytes(){
        List<String> list1 = Arrays.asList(new String[] {"0", "50", "2100", "5100000"});
        List<String> list2 = Arrays.asList(new String[] {"9000000", "1300000000", "12", "190000"});
        List<List<String>> parentList = new ArrayList<>();
        parentList.add(list1);
        parentList.add(list2);

        BytesConverseUtil.converseBytes(parentList, 2);

        assertEquals("2.1KB", parentList.get(0).get(2));
        assertEquals("12B", parentList.get(1).get(2));
    }
}
