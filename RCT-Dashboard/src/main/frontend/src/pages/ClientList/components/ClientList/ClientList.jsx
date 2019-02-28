import React, { Component } from 'react';
import { Table, Pagination, Search, Select, Feedback, Loading } from '@icedesign/base';
import IceContainer from '@icedesign/container';
import axiosInstance from '../../../../axios';

const Toast = Feedback.toast;
export default class ClientList extends Component {
  static displayName = 'ClientList';

  static propTypes = {};

  static defaultProps = {};

  constructor(props) {
    super(props);
    this.queryCache = {};
    const pid = sessionStorage.getItem('pid');
    this.state = {
      dataSource: [],
      total: 0,
      currentPage: '1',
      totalData: [],
      selectData: [],
      selected: '',
      allData: [],
      pageList: [10, 50, 100],
      pid,
      pageSize: 0,
      loading: false,
    };
    this.getSelectData();
  }

  getAllData = () => {
    this.changeLoading();
    axiosInstance
      .get(`/client_list/search?id=${this.state.pid}`)
      .then((response) => {
        this.setState({ totalData: response.data.data, allData: response.data.data, totalData: response.data.data }, () => {
        });
        this.getPageData(response.data.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  changeLoading = () => {
    this.setState({
      loading: true,
    });
  }

  getPageData(data) {
    this.setState({ total: data.length }, () => {});
    let size = this.state.pageSize;
    if (!size) {
      size = 10;
    }
    const page = (this.state.currentPage - 1) * size;
    let newArray = data.slice(page, page + size);
    if (newArray.length === 0) {
      newArray = data.slice(0, 0 + size);
    }
    this.setState({ dataSource: newArray, loading: false }, () => {
    });
  }

  changePage = (currentPage) => {
    this.changeLoading();
    this.setState({ currentPage }, () => {
      this.getPageData(this.state.totalData);
    });
  };

  getSelectData() {
    axiosInstance
      .get(`/redis/query_nodes/${this.state.pid}`)
      .then((response) => {
        if (response.data.code === 200) {
          this.setState({ selectData: response.data.data }, () => {
          });
        } else {
          Toast.error('GET Select Data Faild!');
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  onSearch = (value) => {
    this.changeLoading();
    if (value.key.trim() === '') {
      if (this.state.selected !== 'ALL' && this.state.selected !== '') {
        this.getSearchDate(this.state.selected);
      } else {
        this.getPageData(this.state.allData);
      }
    } else if (this.state.selected === 'ALL') {
      this.sortSearch(value.key.trim(), this.state.allData);
    } else {
      this.sortSearch(value.key.trim(), this.state.totalData);
    }
  };

  sortSearch = (value, data) => {
    const dataSource = [];
    data.map((a) => {
      if (a.age.toString().toLowerCase().search(value.toString().toLowerCase()) !== -1 || a.command.toLowerCase().search(value.toLowerCase()) !== -1 ||
       a.conIp.toString().toLowerCase().search(value.toString().toLowerCase()) !== -1 || a.idle.toString().toLowerCase().search(value.toString().toLowerCase()) !== -1) {
        dataSource.push(a);
      }
    });
    this.setState({
      totalData: dataSource,
      total: dataSource.length,
    });
    this.getPageData(dataSource);
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
      .get(`/client_list/search?id=${this.state.pid}&&host=${value}`)
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

  handlePageSizeChange = (size) => {
    this.changeLoading();
    this.setState({
      pageSize: size,
    }, () => {
      this.getPageData(this.state.totalData);
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
              <span style={{ minWidth: '70px' }}>Redis Node:</span>&nbsp;&nbsp;
              <Select
                showSearch
                placeholder="please select cluster"
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
                width={100}
                sortable
              />
              <Table.Column title="Client" sortable dataIndex="conIp" width={100} />
              <Table.Column
                title="Age(min)"
                dataIndex="age"
                width={70}
                sortable
              />
              <Table.Column
                title="Idle(min)"
                dataIndex="idle"
                width={70}
                sortable
              />
              <Table.Column
                title="Final Command"
                dataIndex="command"
                width={70}
                sortable
              />
            </Table>
            <Pagination
              style={styles.pagination}
              defaultCurrent={1}
              pageSize={this.state.pageSize}
              total={this.state.total}
              onChange={this.changePage}
              pageSizeSelector="dropdown"
              pageSizePosition="end"
              onPageSizeChange={this.handlePageSizeChange}
              pageSizeList={this.state.pageList}
            />
            <p />
            <span>Client Showing {this.state.total} Total Entries</span>
          </IceContainer>
        </Loading>
      </div>
    );
  }
}

const styles = {
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
