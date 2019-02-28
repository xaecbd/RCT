// 菜单配置
// headerMenuConfig：头部导航配置
// asideMenuConfig：侧边导航配置

const asideMenuConfig = [
  {
    name: 'Chart',
    path: '/dashboard',
    icon: 'chart',
  },
  {
    name: 'RDB Analyze',
    path: '/rdb',
    icon: 'content',
  },
  {
    name: 'Slowlog',
    path: '/slowlog',
    icon: 'ul-list',
  },
  
  {
    name: 'Client List',
    path: '/client',
    icon: 'ul-list',
  },
];

const headerMenuConfig = asideMenuConfig;

export default headerMenuConfig;
