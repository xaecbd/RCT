/* eslint-disable import/first */

import React, { Component } from 'react';
import { Grid, Feedback, Loading, Input, Dialog, Icon } from '@icedesign/base';
import { withRouter } from 'react-router-dom';
import axiosInstance from '../../../../axios';

import {
  FormBinderWrapper,
  FormBinder,
  FormError,
} from '@icedesign/form-binder';

const { Row, Col } = Grid;
const Toast = Feedback.toast;


const mode = (value) => {
  const values = parseInt(value, 10);
  if (values === 1) {
    return 'Cluster';
  }
  return 'Single';
};


@withRouter
export default class ClusterList extends Component {
  static propTypes = {};
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      clusterList: [],
      visible: false,
      delVis: false,
      addAction: false,
      displayValue: '',
      item: {},
      isError:false,
      formValue: {
        name: '',
        address: '',
        password: '',
        id:'',
      },
      beforechange:{},
    };
    this.fetchClusterList();
  }

  onChange = (value) => {
    this.state.formValue.mode = value;
    this.setState({
      formValue: this.state.formValue,
    });
  }

  fetchClusterList() {
    axiosInstance
      .get('/redis/')
      .then((res) => {
        if(res.data.code===200){
            this.setState({
                clusterList: res.data.data,
            });
        }else{
            Toast.error('Fetch redis list failed!');
           
        }
        
      }).catch((error) => {
        Toast.error('Fetch redis list failed!');
        console.log(error);
      });
  }

    refreshData = () => {
      this.fetchClusterList();
    }


  onClose = () => {
    this.setState({
      visible: false,
    });
  };


      onEditClicks = (e, clusterInfo) => {       
        this.state.formValue.name = clusterInfo.name;
        this.state.formValue.address = clusterInfo.address;
        this.state.formValue.id = clusterInfo.id;
        if(clusterInfo.password===null){
            this.state.formValue.password = '';
        }else{
            this.state.formValue.password = clusterInfo.password;
        }
        
        this.setState({
          visible: true,
          formValue: this.state.formValue,
          displayValue: 'Edit',
          addAction: false,
          beforechange:clusterInfo,
        });       
      }
      onSave = () => {
        this.setState({
          visible: true,
          formValue: {},
          displayValue: 'Add',
          addAction: true,
        });
      }
      handleSubmit = () => {
        this.form.validateAll((errors, values) => {
          if (errors) {
            console.log('errors', errors);
            return;
          }

          if (this.state.addAction) {
            axiosInstance
              .post('/redis/', values).then((res) => {
                if(res.data.code===200){
                    Toast.success(res.data.message);
                    this.refreshData();
                    this.setState({
                      visible: false,
                    });
                }else{
                    Toast.error(res.data.message);
                    this.setState({
                        formValue:this.state.beforechange,
                    });   
                   
                }
               
              }).catch((error) => {
                Toast.error('Add redis failed!');
                console.log(error);
              });
          } else {
            axiosInstance
              .put('/redis/', values).then((res) => {
                if(res.data.code===200){
                    Toast.success(res.data.message);
                    this.refreshData();
                    this.setState({
                      visible: false,
                    });
                }else{
                    Toast.error(res.data.message);      
                    this.setState({
                        formValue:this.state.beforechange,
                    });     
                   
                }
                   
              }).catch((error) => {
                Toast.error('Update redis failed!');
                console.log(error);
              });
          }
        });
      };

      onDelClose = () => {
        this.setState({
          delVis: false,
        });
      }
      onDel = (item) => {
        this.setState({
          delVis: true,
          item,
        });
      }
      DelSumbit = () => {
        axiosInstance
          .delete(`/redis/${this.state.item.id}`)
          .then((res) => {
            Toast.success(res.data.message);
            this.refreshData();
            this.setState({
              delVis: false,
            });
          }).catch((error) => {
            Toast.error('Remove redis failed!');
            console.log(error);
          });
      }

      onRounte = (e, info) => {
        this.props.history.push({ pathname: '/dashboard' });
        sessionStorage.setItem('pid', info.id);
      }
      onFormChange = (formValue) => {
         if(!this.state.isError){
            this.setState({
                formValue,
              });
          }
       
      };
      render() {
        const data = this.state.clusterList;
        if (data === null) {
          return (<Loading shape="dot-circle" />);
        }

        return (
          <div style={styles.container}>
            <Row wrap gutter="20">
              <Col l="6" xs="12" xxs="24">
                <div style={{ ...styles.card, ...styles.createScheme }} onClick={(e) => { this.onSave(e); }}>
                  <Icon type="add" size="large" style={styles.addIcon} />
                  <span>Add New Redis</span>
                </div>
              </Col>
              {data.map((item, index) => {
                return (
                  <Col l="6" xs="12" xxs="24" key={index} >
                    <div style={{ ...styles.card }} >
                      <div style={styles.head}>
                        <h4 style={styles.title} onClick={(e) => { this.onRounte(e, item); }}>{item.name}</h4>
                        <p style={styles.desc}>{item.desc}</p>
                        <Icon type="edit" size="xs" style={styles.editIcons} onClick={(e) => { this.onEditClicks(e, item); }} />
                        <Icon type="ashbin" size="xs" style={styles.closeIcons} onClick={() => { this.onDel(item); }} />
                      </div>
                      <div style={styles.body} onClick={(e) => { this.onRounte(e, item); }} >

                        <Row wrap gutter="20" style={{ ...styles.creator, ...styles.info }} >
                          <Col l="6" xs="12" xxs="24" style={styles.info}>
                                Address:
                          </Col>
                          <Col l="6" xs="12" xxs="24" style={styles.info}>
                            {item.address}
                          </Col>
                        </Row>
                        <Row wrap gutter="20" style={{ ...styles.creator, ...styles.info }}>
                          <Col l="6" xs="12" xxs="24" style={styles.info}>
                            Mode:
                          </Col>
                          <Col l="6" xs="12" xxs="24" style={styles.info}>
                            {mode(item.mode)}
                          </Col>
                        </Row>


                      </div>

                    </div>
                  </Col>
                );
              })}
            </Row>
            <Dialog
              visible={this.state.delVis}
              onOk={this.DelSumbit}
              closable="esc,mask,close"
              onCancel={this.onDelClose}
              onClose={this.onDelClose}
              title="Delete"
            >
                Are you sure to Delete?
            </Dialog>
            <Dialog
              style={{ width: window.innerWidth * 0.4 }}
              visible={this.state.visible}
              onOk={this.handleSubmit}
              closable="esc,mask,close"
              onCancel={this.onClose}
              onClose={this.onClose}
              title={this.state.displayValue}
            >
              <div className="cluster-form" style={styles.simpleFluencyForm}>

                <FormBinderWrapper
                  ref={(form) => {
              this.form = form;
            }}
                  value={this.state.formValue}
                  onChange={this.formChange}
                >
                  <div style={styles.formContent}>
                    <Row style={styles.formRow}>
                      <Col xxs="8" s="7" l="6" style={styles.formLabel}>
                        <span>Redis Name</span>
                      </Col>
                      <Col xxs="16" s="15" l="14">
                        <FormBinder required message="Required">
                          <Input name="name" />
                        </FormBinder>
                        <div style={styles.formErrorWrapper}>
                          <FormError name="name" />
                        </div>
                      </Col>
                    </Row>
                    <Row style={styles.formRow}>
                      <Col xxs="8" s="7" l="6" style={styles.formLabel}>
                        <span>Redis Address</span>
                      </Col>
                      <Col xxs="16" s="15" l="14">
                        <FormBinder required message="Required">
                          <Input name="address" placeholder="127.0.0.1:9000" />
                        </FormBinder>
                        <div style={styles.formErrorWrapper}>
                          <FormError name="address" />
                        </div>
                      </Col>
                    </Row>
                    <Row style={styles.formRow}>
                      <Col xxs="8" s="7" l="6" style={styles.formLabel}>
                        <span>Password</span>
                      </Col>
                      <Col xxs="16" s="15" l="14">
                        <FormBinder  >
                          <Input name="password" />
                        </FormBinder>
                      </Col>
                    </Row>
                  </div>
                </FormBinderWrapper>

              </div>
            </Dialog>

          </div>


        );
      }
}


const styles = {
  formRow: { marginTop: 20 },
  input: { width: '100%' },
  formLabel: { lineHeight: '26px' },
  item: {
    width: '25%',
    padding: '0 10px',
  },
  desc: {
    margin: 0,
    fontSize: '12px',
  }, 
  container: {
    height: '100%',
  },
  info: {
    margin: '0 0 10px',
    fontSize: '13px',
    textArea: 'left',
    marginTop: '20px',
  },

  icon: {
    marginRight: '5px',
  },
  link: {
    cursor: 'pointer',
    color: '#a84ef9',
  },
  createScheme: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '190px',
    cursor: 'pointer',
  },
  card: {
    displayName: 'flex',
    marginBottom: '20px',
    background: '#fff',
    borderRadius: '6px',
    height: '190px',
  },
  head: {
    position: 'relative',
    padding: '16px 16px 8px',
    borderBottom: '1px solid #e9e9e9',
  },
  title: {
    margin: '0 0 5px',
    width: '90%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: '16px',
    fontWeight: '500',
    color: 'rgba(0,0,0,.85)',
    cursor: 'pointer',
  },
  body: {
    position: 'relative',
    padding: '16px',
    cursor: 'pointer',
  },
  addIcon: {
    marginRight: '10px',
  },
  editIcon: {
    position: 'absolute',
    right: '0',
    bottom: '0',
    cursor: 'pointer',
  },
  editIcons: {
    right: '80px',
    bottom: '0',
    cursor: 'pointer',
    float: 'right',
    marginTop: '-37px',
  },
  closeIcons: {
  	right: '27px',
    bottom: '0',
    cursor: 'pointer',
    float: 'right',
    marginTop: '-37px',
  },
};

