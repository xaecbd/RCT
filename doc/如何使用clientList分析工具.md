## Client List模块介绍

### Client List
   展示连接redis客户端的ClientIP以及IP连接的时长，最后一次执行的命令以及redis客户端的空闲时间。

### Statistics
   分别从server端和client端两个维度对redis连接数的统计

### Monitors
   该模块将clientList模块统计的信息写入Eleasticsearch中，方便二次分析

#### 页面参数说明
1.  Interval：统计信息的频率
2.  Exetime:第一个输入框输入的数字，第二个选择框可选时间单位，表示任务执行收集的一个时间段
3.  Status：任务执行的状态

点击Execute,确认之后job即可调度执行，点击Cancel,可将正在运行的job取消掉

