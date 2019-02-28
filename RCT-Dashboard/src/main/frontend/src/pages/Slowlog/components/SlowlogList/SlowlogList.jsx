import React, { Component } from 'react';
import { Table, Pagination, Search, Select, Loading } from '@icedesign/base';
import IceContainer from '@icedesign/container';
import axiosInstance from '../../../../axios';

import './SlowlogList.scss';

const render = (value, index, record) => {
  const time = parseInt(record.runTime, 10);
  const result = Math.round(time / 1000);
  return `${result}`;
};


const renderTime = (text) => {
  return <div title={text} className="colClas">{text}</div>;
};

export default class SlowlogList extends Component {
  static displayName = 'SlowlogList';

  static propTypes = {};

  static defaultProps = {};

  constructor(props) {
    super(props);
    this.queryCache = {};
    const pid = sessionStorage.getItem('pid');
    this.state = {
      dataSource: [],
      total: 0,
      currentPage: 1,
      totalData: [],
      selectData: [],
      selected: '',
      allData: [],
      pageSize: 0,
      deafultPage: 1,
      loading: false,
      pageList: [10, 50, 100],
      pid,

    };
    this.getSelectData();
  }

  fetchData = () => {
    this.getSearchData(null, null);
  };

  getPageData(data) {
    const page = (this.state.currentPage - 1) * this.state.pageSize;
    const newArray = data.slice(page, page + this.state.pageSize);
    this.setState({ dataSource: newArray, loading: false }, () => {
    });
  }

  changePage = (currentPage) => {
    this.changeLoading();
    this.setState({ currentPage }, () => {
      this.getPageData(this.state.totalData);
    });
  };

  handlePageSizeChange = (size) => {
    this.changeLoading();
    this.setState({
      pageSize: size,
    }, () => {
      this.getPageData(this.state.totalData);
    });
  }

  getSelectData() {
    axiosInstance
      .get(`/redis/query_nodes/${this.state.pid}`)
      .then((response) => {
        this.setState({ selectData: response.data.data }, () => {

        });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  onSearch = (value) => {
    if (value.key.trim() === '') {
      if (this.state.selected !== 'ALL' && this.state.selected !== '') {
        this.getSearchDate(this.state.selected);
      } else {
        this.getAllData();
      }
    } else if (this.state.selected === 'ALL') {
      this.sortSearch(value.key.trim(), this.state.allData);
    } else {
      this.sortSearch(value.key.trim(), this.state.totalData);
    }
  };


  sortSearch = (value, data) => {
    this.changeLoading();
    const dataSource = [];
    data.map((a) => {
      if (a.SlowDate.toLowerCase().search(value.toLowerCase()) !== -1 || a.runTime.toLowerCase().search(value.toLowerCase()) !== -1 ||
        a.type.toLowerCase().search(value.toLowerCase()) !== -1 || a.command.toLowerCase().search(value.toLowerCase()) !== -1) {
        dataSource.push(a);
      }
    });
    this.setState({
      totalData: dataSource,
      total: dataSource.length,
    });
    this.getPageData(dataSource);
  }

  changeLoading = () => {
    this.setState({
      loading: true,
    });
  }

  getAllData = () => {
    this.changeLoading();
    axiosInstance
      .get(`/slowlog/slow_search?id=${this.state.pid}`)
      .then((response) => {
        this.setState({ totalData: response.data.data, allData: response.data.data, total: response.data.data.length }, () => {

        });

        this.getPageData(response.data.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  onSearchs = (value) => {
    const result = [];
    this.getSelectData();
    this.state.selectData.map((db) => {
      const reg = new RegExp(value);
      if (db.value.match(reg)) {
        const data = { value: db.value, label: db.label };
        result.push(data);
      }
    });
    this.setState({ selectData: result });
  }
  onSelect = (value) => {
    this.setState({ selected: value });
    if (value === 'ALL') {
      this.getAllData();
    } else {
      this.getSearchDate(value);
    }
  }

  getSearchDate = (value) => {
    this.changeLoading();
    axiosInstance
      .get(`/slowlog/slow_search?id=${this.state.pid}&&host=${value}`)
      .then((response) => {
        this.setState({ totalData: response.data.data, total: response.data.data.length }, () => {
        }, () => {

        });
        this.getPageData(response.data.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  onSort(value, order) {
    this.changeLoading();
    let dataSource = [];
    if ((typeof value) !== 'number') {
      dataSource = this.state.totalData.sort((a, b) => {
        if (order === 'asc') {
          return a[value].localeCompare(b[value]);
        } else if (order === 'desc') {
          return b[value].localeCompare(a[value]);
        }
      });
    } else {
      dataSource = this.state.totalData.sort((a, b) => {
        if (order === 'asc') {
          return a[value] - b[value];
        } else if (order === 'desc') {
          return b[value] - a[value];
        }
      });
    }
    this.setState({ dataSource });
    this.getPageData(dataSource);
  }

  render() {
    if (this.state.pageSize === 0) {
      this.setState({
        pageSize: 10,
      });
    }
    return (
      <div className="enhance-table" style={styles.enhanceTable}>
        <Loading tip="Loading..." shape="fusion-reactor" visible={this.state.loading} style={{ width: '100%', height: '100%' }} >
          <IceContainer style={styles.card}>
            <div style={styles.formItem}>
              <span style={{ minWidth: '70px' }}>Redis Node:  </span>&nbsp;&nbsp;
              <Select
                showSearch
                placeholder="please select ip"
                onSearch={e => this.onSearchs(e)}
                onChange={e => this.onSelect(e)}
                size="large"
                style={{ width: '200px' }}
              >
                {
                this.state.selectData.map((db) => {
                return <Select.Option value={db.value} key={db.value}>{db.label}</Select.Option>;
                 })
               }
              </Select>
            </div>
            <div style={styles.extraFilter}>
              <Search
                style={styles.search}
                type="primary"
                inputWidth={150}
                placeholder="select"
                searchText=""
                onSearch={this.onSearch}
              />
            </div>
          </IceContainer>
          <IceContainer>
            <Table
              dataSource={this.state.dataSource}
              className="basic-table"
              style={styles.basicTable}
              hasBorder={false}
              onSort={(value, order) => this.onSort(value, order)}
            >
              <Table.Column
                title="Host"
                dataIndex="host"
                width={90}
                sortable
              />
              <Table.Column title="Slow Date" sortable dataIndex="SlowDate" width={80} />
              <Table.Column
                title="Run Time(ms)"
                dataIndex="runTime"
                width={50}
                cell={render}
                sortable
              />
              <Table.Column
                title="Type"
                dataIndex="type"
                width={60}
                sortable
              />
              <Table.Column
                title="Command"
                dataIndex="command"
                width={450}
                cell={renderTime}
              />
            </Table>

            <Pagination
              style={styles.pagination}
              defaultCurrent={this.state.deafultPage}
              pageSize={this.state.pageSize}
              total={this.state.total}
              onChange={this.changePage}
              pageSizeSelector="dropdown"
              pageSizePosition="end"
              onPageSizeChange={this.handlePageSizeChange}
              pageSizeList={this.state.pageList}
            />
            <p />
            <span style={{ paddingTop: '26px', textAlign: 'left' }}>Slowlog Showing {this.state.total} Total Entries</span>
          </IceContainer>
        </Loading>
      </div>
    );
  }
}

const styles = {
  title: {
    marginLeft: '10px',
    lineHeight: '20px',
  },
  card: {
    minHeight: 0,
    marginBottom: 20,
    display: 'flex',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  extraFilter: {
    display: 'flex',
    alignItems: 'center',
  },
  search: {
    marginLeft: 10,
  },
  pagination: {
    textAlign: 'right',
    paddingTop: '26px',
    float: 'right',
  },
  formItem: {
    display: 'flex',
    alignItems: 'center',
    margin: '10px 0',
  },
};
