## Introduction to Client List module

### Client List
   Shows the duration of the ClientIP and IP connection to the Redis client, the last command executed, and the idle time of the Redis client.

### Statistics
   The number of Redis connections was calculated from the two dimensions of server side and client side respectively.

### Monitors
   This module writes the statistical information of the clientList module into Elasticsearch to facilitate secondary analysis.

#### Page parameter description
1.  Interval：A frequency of statistical information
2.  Exetime:The number entered in the first input box and the unit of time in the second selection box indicate a time period during which the task was collected
3.  Status：The state of the task execution

Click Execute to schedule the execution of the job after confirmation, and click Cancel to Cancel the running job.

