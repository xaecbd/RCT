##  Project Context       
  Redis is indispensable to the Internet in the product development regular weapons, its high performance, rich data structure, easy to use, but also because it's too easy to use, the development of our students no matter what, no matter how big is this data, data, no matter how much data are all in the last problem is caused by Redis memory usage continues to rise, but don't know if the data is useful, whether can be split and clean up. In order to better use Redis, in addition to making some use of rules and regulations for Redis, it is necessary to have a full understanding of Redis used online. So here's the question: if an instance of Redis USES that much memory, what's in it? What are the keys? How much space does each key take up?

 At present, we have 4 Redis clusters of EC Bigdata team, including 300+ Redis instances and 500G+ memory data. We want to analyze whether the business is misused to improve resource utilization. With the extensive use of the business team, recent data growth is relatively fast, we urgently need a tool to analyze the data stored in various businesses, whether to store dead data and waste resources; At the same time, business feedback from E4 WWW Redis cluster indicates that there are obvious slow queries recently, so we need to analyze slow log and common stored data types Hash,List and Set, whether there is a big key causing slow queries, whether there is a team with a large big key and unreasonable setting of TTL

Is there any way we can safely and efficiently see detailed reports of Redis memory consumption? There are more solutions than problems, and where there is a need there is a solution. EC Bigdata team has implemented a Redis data visualization platform (Redis Computed Tomography) for this problem.

RCT can be very convenient to analyze the memory of Reids to understand what keys are in an instance of Redis, how much space is occupied by which type of keys, what are the keys that consume the most memory and what are their proportions, which is very intuitive. In addition, we can also monitor the status of cluster effect at the minute level for Redis slow query.

## Project Design
### Redis data analysis solution
1. ~~Go through the keys * command, get all the keys, and then get all the content based on the key.~~

advantages：Can not use Redis machine hard disk, direct network transmission

disadvantages：If the number of keys is particularly large, the keys command may cause Redis to jam and affect business; Very many requests are needed for Redis, which consumes a lot of resources. Traversing data is too slow

2. ~~Open aof, get all data through aof file~~

advantages：No need to affect Redis service, completely offline operation, enough security

disadvantages：Some Redis instances write frequently, not suitable for opening aof, not universal; Aof files can be extremely large, slow to transfer and parse, and inefficient.

3. Use bgsave to get the RDB file and get the data after parsing。

advantages：Mature mechanism and good reliability; Relatively small file, transmission, high parsing efficiency；

disadvantages：Although bgsave will fork the child process, it may cause the main process to get stuck for a period of time, which may have an impact on the business；

After evaluating the above methods, we decided to use **to obtain the RDB file** after bgsave from the node in the low peak period, which is relatively safe and reliable and can also cover the Redis cluster of all businesses. Getting the RDB file is equivalent to getting all the data of the Redis instance. The next step is to generate the report：

Parse the RDB file to get the contents of Key and Value; According to the corresponding data structure and content, estimate the memory consumption; Statistics and generate reports; The logic is simple, so the design idea is clear.
### Data flow diagram
![](./screenshots/数据流.png)
### System architecture
![](./screenshots/系统架构.jpg)