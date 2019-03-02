### 快速使用RDB分析工具进行RDB分析

在使用RDB分析工具进行RDB分析时，需要在redis机器上部署好RCT-Anaylze分析器
### Deploy RCT-Anaylze
不管是通过docker还是jar部署，都要将分析器程序部署在你要分析的redis集群或者redis实例的所有机器上，由于我们的架构采用springCloud的Eureka(服务的注册与发现)，所有的分析器都只有一个中心节点，即RCT-DashBoard程序。

部署完成后，即可对redis的RDB文件进行分析，部署步骤如下:

首先通过导航进入到RDB Analyze模块
#### 1.完善RDB分析配置信息
   如果之前没有添加过RDB分析配置信息，在页面弹出的添加页面中，完善rdb信息。页面具体参数[详见](./如何使用RDB分析工具.md)
#### 2.进行RDB分析
 完善RDB分析配置信息之后，点击右下方的Analyze按钮，点击确认之后，中心节点(RCT-DashBoard)开始将任务分发各redis节点部署的RCT-Anaylze分析程序中，分析程序开始对本机redis节点生成的rdb文件进行分析，并将分析的状态与进度反馈给中心节点。中心节点(RCT-DashBoard)分发成功之后，弹出分析成功对话框，点击框内的view Progress按钮，可以查看到各个节点的分析进度。 
 如果不慎退出分析进度页面，也可以在RDB Analyze模块的status信息中，点击view progress按钮就可以再次进入到进度页面。 
#### 3.查看分析结果
 RDB文件分析成功之后，分析结果会写入到数据库rdb_analyze_result表中，如若RDB分析信息中配置了report，则分析完成之后会将分析结果发送邮件给配置的收件人。
 分析结果也会以可视化的形式展示给用户，具体详见[chart模块](./Chart模块介绍.md)

至此，一次简单的rdb分析就结束了。
   
#### 注意

##### 1.定时对RDB文件进行分析
对rdb文件进行定时分析时，必须填写正确的cron表达式，如果不填写或者cron为错误，则定时任务会失败。
##### 2.RDB分析时Loading等待时间较长
在点击分析之后，Loading的过程是服务器在向redis节点分发分析任务，如若没有打开rdb持久化，
 则会先去生成rdb文件，生成rdb文件的过程时间较长导致loading的等待时间较长。(Loading的超时时间为40分钟)。
##### 3.如果集群没有打开rdb持久化，rdb分析怎么使用
首先需要在配置文件application.properties 中修改配置为```rct.rdb.generate.enable=true```
如果集群没有开启rdb的持久化，则点击分析之后，程序会选择salve节点自动生成rdb文件，生成文件的目录遵循redis中配置的路径。生成rdb之后进行分析。

**rdb文件的生成是串行的，并且只在slave中执行**，这样确保整个集群只有一个实例在做持久化，我们已经将性能影响降到最低，经测试，线上业务无感知。
