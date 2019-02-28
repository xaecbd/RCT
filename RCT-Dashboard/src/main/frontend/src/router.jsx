/**
 * 定义应用路由
 */
import { HashRouter, Switch, Route } from 'react-router-dom';
import React from 'react';
import UserLayout from './layouts/UserLayout';
import BasicLayout from './layouts/BasicLayout';
import DashLayout from './layouts/DashLayout';

// 按照 Layout 分组路由
// UserLayout 对应的路由：/user/xxx
// BasicLayout 对应的路由：/xxx
const router = () => {
  return (
    <HashRouter>
      <Switch>
        <Route path="/user" component={UserLayout} />
        <Route path="/rct" component={DashLayout} />
        <Route path="/" component={BasicLayout} />
      </Switch>
    </HashRouter>
  );
};

export default router();
