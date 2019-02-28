// 以下文件格式为描述路由的协议格式
// 你可以调整 routerConfig 里的内容
// 变量名 routerConfig 为 iceworks 检测关键字，请不要修改名称

import UserLogin from './pages/UserLogin';
import Dashboard from './pages/Dashboard';
import RedisInfo from './pages/RedisInfo';
import ClientMain from './pages/ClientList';
import RDBAnalyze from './pages/RDBAnalyze';
import SlowlogMain from './pages/Slowlog';
import SlowlogList from './pages/Slowlog/components/SlowlogList';
import SlowlogSta from './pages/Slowlog/components/SlowlogStatis';
import SlowlogMon from './pages/Slowlog/components/SlowlogMonitors';
import ClientList from './pages/ClientList/components/ClientList';
import ClientSta from './pages/ClientList/components/Statistics';
import ClientMon from './pages/ClientList/components/Monitors';
import RDBNodeList from './pages/RDBAnalyze/components/RDBNodeList';

const routerConfig = [{
  path: '/user/login',
  component: UserLogin,
},
{
  path: '/dashboard',
  component: Dashboard,
},
{
  path: '/slowlog',
  component: SlowlogMain,
},
{
  path: '/rdb',
  component: RDBAnalyze,
},
{
  path: '/rdb_progress',
  component: RDBNodeList,
},
{
  path: '/client',
  component: ClientMain,
},
{
  path: '/rct',
  component: RedisInfo,
},
{
  path: '/client_list',
  component: ClientList,
}, {
  path: '/client_statistics',
  component: ClientSta,
}, {
  path: '/client_monitors',
  component: ClientMon,
},
{
  path: '/slowlog_list',
  component: SlowlogList,
},
{
  path: '/slowlog_monitor',
  component: SlowlogMon,
},
{
  path: '/slowlog_statistic',
  component: SlowlogSta,
},
];

export default routerConfig;
