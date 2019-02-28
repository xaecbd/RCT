appName=`ls |grep jar|grep RCT`
echo start to run $appName

if [ -n "$JAVA_OPTIONS" ];then
	java $JAVA_OPTIONS -jar $appName   $option
else 
    java -jar $appName   $option
fi