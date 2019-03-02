/**
 * 
 */
package org.nesc.ecbd.test;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * @author Hulva Luva.H
 * @since 2018年4月12日
 *
 */
public class StringReplaceTest {

  private static final String patternString = "\\{\\w+\\}";
  /**
   * @param args
   */
  public static void main(String[] args) {
    // String a = "dsasd\\dsd\\sds\\";
    // System.out.println(a);
    //
    // System.out.println(a.split("\\\\")[0]);
    // a.replaceAll("\\\\", "/");
    // System.out.println(a);

    Pattern pattern = Pattern.compile(patternString);
    Matcher matcher = pattern.matcher("eda{dsadsadasdasd}dsd");
    matcher.find();
    System.out.println(matcher.group(0));
  }

}
