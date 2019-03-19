/* eslint-disable indent */
import React, { Component } from 'react';
import IceContainer from '@icedesign/container';
import { Grid, Icon, Button, Dialog, Switch, Feedback, Input, Balloon, Checkbox, Loading } from '@icedesign/base';
import { withRouter } from 'react-router-dom';
import axiosInstance from '../../../../axios';
import StartAnalyze from './StartAnalyze';
import { FormBinderWrapper, FormBinder, FormError } from '@icedesign/form-binder';

axiosInstance.defaults.timeout = 2400000;
const { Row, Col } = Grid;
const { Group: CheckboxGroup } = Checkbox;
// 分析器对应关系
const analyzerMap = new Map([
  ['0', 'Report'],
  ['5', 'ExportKeyByPrefix'],
  ['6', 'ExportKeyByFilter'],
]);

const checkboxDataMap = [
    {
      value: 0,
      label: 'Report',
    },
    {
      value: 5,
      label: 'ExportKeyByPrefix',
    },
    {
      value: 6,
      label: 'ExportKeyByFilter',
    },
  ];
function getCheckboxData(analyzer) {
  const result = [];
  analyzer.forEach((num) => {
    result.push(analyzerMap.get(num.toString()));
  });
  return result.join(', ');
}
@withRouter
export default class RDBMainPage extends Component {
  constructor(props) {
    super(props);
    const pid = sessionStorage.getItem('pid');
    this.state = {
      completeDialogData: {},
      complexDialogVisible: false,
      openVisable: false,
      cronData: [],
      loading: false,
      disable: true,
      disName: 'Add',
      autoDiasble:true,
      information: {
        id: '',
        autoAnalyze: false,
        schedule: '',
        dataPath: '',
        prefixes: '',
        report: false,
        mailTo: '',
        analyzer: [],
        name: '',
        status: false,
        
        pid,
      },
      endInformation:{},
    };
  }

 componentWillMount() {
    this.getData();
 }

  changeAnalyzeToArray = (analyzer) => {
    if (analyzer != null && analyzer !== '') {
      if (!(analyzer instanceof Array)) {
        let news = [];
        news = (analyzer).split(',');
        const results = [];
        for (let i = 0; i < news.length; i += 1) {
          if (news[i] !== '') {
            results.push(parseInt(news[i], 10));
          }
        }
        analyzer = results;
      }
    } else {
      analyzer = [];
    }
    return analyzer;
  }

  onScheduleChange = (value) => {
    const querybody = { schedule: value.trim() };
    if (querybody) {
      axiosInstance
      .post('/test_corn', querybody)
      .then((response) => {
        if (response.data.code === 200 && response.data.data.length > 0) {
            const data = this.state.endInformation;
            data.autoAnalyze = true;
            this.setState({
                 cronData: response.data.data,
                 endInformation: data,

            });
        }
      })
      .catch((error) => {
        console.log(error);
      });
    } else {
        this.setState({
            disable: true,
        });
    }
  }

  autoAnalyzeChange = (values) => {
       const data = this.state.information;
       data.autoAnalyze = values;
       data.analyzer = data.analyzer.toString();
       axiosInstance
       .put('/rdb', data)
       .then((res) => {
         if (res.data.code === 200) {
           Feedback.toast.success(res.data.message);
           this.setState({
             openVisable: false,
             information: data,
           });
         } else {
           Feedback.toast.error(res.data.message);
         }
       }).catch((error) => {
         console.log(error);
       });
  }

  autoChange = (values) =>{
     const data = this.state.endInformation;
     data.autoAnalyze = values;
     if(values){
         this.setState({
             disable:false,
         });
     }else{
        this.setState({
            disable:true,
        });
     }
     this.setState({
         endInformation:data
     });
  }

  getCronList =(values) => {
    axiosInstance
      .post('/test_corn', values)
      .then((response) => {
        if (response.data.code === 200 && response.data.data.length > 0) {
            // const data = this.state.information;
            // data.autoAnalyze = true;
            this.setState({
                 cronData: response.data.data,
             //    information: data,

            });
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }


  getData=() => {
    axiosInstance
      .get(`/rdb/pid/${this.state.information.pid}`)
      .then((res) => {
        if (res.data.code === 200) {
          if (res.data.data.info.id !== null) {
            this.state.information.id = res.data.data.info.id;
            this.state.information.autoAnalyze = res.data.data.info.autoAnalyze;
            this.state.information.schedule = res.data.data.info.schedule;
            this.state.information.dataPath = res.data.data.info.dataPath;
            this.state.information.prefixes = res.data.data.info.prefixes;
            this.state.information.report = res.data.data.info.report;
            this.state.information.mailTo = res.data.data.info.mailTo;
            this.state.information.analyzer = this.changeAnalyzeToArray(res.data.data.info.analyzer);
            this.state.information.name = res.data.data.info.redisInfo.name;
            this.state.information.status = res.data.data.status;
            if (res.data.data.info.schedule) {
                // console.log('comes');
                this.setState({
                    autoDiasble: false,
                });
                const querybody = { schedule: res.data.data.info.schedule.trim() };
                this.getCronList(querybody);
            }
            this.setState({
              information: this.state.information,
              disName:'Edit',
            });
          } else {
            this.setState({
              information: this.state.information,
              openVisable: true,
              disName:'Add',
            });
          }
        }
      }
      ).catch((error) => {
        console.log(error);
      });
  }

 showProgress = () => {
   this.props.history.push('/rdb_progress');
 }


 handleOpenEditPanel = () => {
   var obj = Object.create(this.state.information);
   this.setState({
     openVisable: true,
     endInformation:obj,
   });
 }

 handleCloseEditPanel = () => {
   this.setState({
     openVisable: false
   });
 }


 validateFields = () => {
   const { validateAll } = this.form;
   validateAll((errors, values) => {
     if (!errors) { 
       const data = values;
       data.analyzer = data.analyzer.toString();
       if(data.schedule){
        this.setState({
            autoDiasble: false,
          });
       }else{
        this.setState({
            autoDiasble: true,
         });
       }       
       this.state.information.analyzer = data.analyzer;
       this.state.information.autoAnalyze = data.autoAnalyze;
       this.state.information.schedule = data.schedule;
       this.state.information.dataPath = data.dataPath;
       this.state.information.prefixes = data.prefixes;
       this.state.information.report   = data.report;
       this.state.information.mailTo   = data.mailTo;
       
       this.setState({
        information:this.state.information,      
       });

       if (this.state.disName === 'Add') {
         axiosInstance
           .post('/rdb', this.state.information)
           .then((res) => {
             if (res.data.code === 200) {
               const response = this.state.information;
               response.id = res.data.data;
               Feedback.toast.success(res.data.message);
               this.setState({
                 openVisable: false,
                 information: response,
                 disName: 'Edit',
               });
               this.getData();
             } else {
               Feedback.toast.error(res.data.message);
             }
           }).catch((error) => {
             console.log(error);
           });
       } else {
         axiosInstance
           .put('/rdb', this.state.information)
           .then((res) => {
             if (res.data.code === 200) {
               Feedback.toast.success(res.data.message);
               this.setState({
                 openVisable: false,
               });
               this.getData();
             } else {
               Feedback.toast.error(res.data.message);
             }
           }).catch((error) => {
             console.log(error);
           });
       }
     }
   });
 }

 renderFooter = () => {
   return (
     <div style={styles.footer}>
       <Button onClick={() => { this.showProgress(); }} type="primary">
          view analyze process
       </Button>
     </div>
   );
 };

 getInfoDiv = () => {
    return (
      <div>
        allot analyze job success! <br />Now you can view analyze process .
      </div>
    );
  }

  renderLoadingFooter = () => {
    return (<p />);
  }
  renderFailFooter = () => {
    return (
      <div style={styles.footer}>
        <Button onClick={() => { this.hideCompleteDialog(); }} type="primary">
          back
        </Button>
      </div>
    );
  };

  changeLoading = () => {
     this.setState({
        loading: true,
     });
  }

  handleExec(id) {
    this.changeLoading();
    axiosInstance
      .get(`/rdb/allocation_job/${id}`)
      .then((res) => {
        if (res.data.code === 200) {
          let dialogData = {};
          if (res.data.data.status) {
            dialogData = {
              title: 'Allocation analyze job success ',
              imageSrc: '../../../../../public/images/success.jpg',
              info: this.getInfoDiv(),
              status: true,
            };
          } else {
            dialogData = {
              title: 'Allocation analyze job Fail ',
              imageSrc: '../../../../../public/images/fail.jpg',
              info: res.data.data.message,
              status: false,
            };
          }
          this.displyDialog(dialogData);
        } else {
          Feedback.toast.error(res.data.data.message);
        }
      }).catch((error) => {
         Feedback.toast.error('start analyze failed!');
           this.setState({
             loading: false,
           });
        console.log(error);
      });
  }

  hideCompleteDialog = () => {
    this.setState({
      complexDialogVisible: false,
    });
  }

  displyDialog = (dialogData) => {
    this.setState({
      completeDialogData: dialogData,
      complexDialogVisible: true,
      loading: false,
    });
  }


  Selects(value) {
    const data = this.state.endInformation;
    data.analyzer = value;
    this.setState({
        endInformation: data,
    });
  }

  render() {
    let statusIcon;
    if (this.state.disName === 'Edit') {
      if (this.state.information.status) {
        statusIcon = (
          <div>
            <Icon type="loading" style={{ color: '#FF3333' }} />
            &nbsp;&nbsp;&nbsp;&nbsp;
            <Button shape="text" onClick={() => this.showProgress()}>
              <Icon type="process" />view process
            </Button>
          </div>
        );
      } else {
        statusIcon = (<Icon type="success" style={{ color: '#1DC11D' }} />);
      }
    } else {
      statusIcon = (<span>please add the rdb info!!!</span>);
    }


    const clickTrigger = (
      <Icon type="prompt" style={{ margin: '6px', lineHeight: '1.7rem', marginTop: '2px' }} />
      );

    return (
      <div>
        <Dialog
          style={{ width: '800px' }}
          visible={this.state.openVisable}
          onOk={this.validateFields}
          closable="esc,mask,close"
          onCancel={this.handleCloseEditPanel}
          onClose={this.handleCloseEditPanel}
          title={this.state.disName}
        >
          <FormBinderWrapper
            value={this.state.endInformation}
            ref={(c) => { this.form = c; }}
          >
            <div>
              {/* autoAnalyze */}
              <Row style={styles.formRow}>
                <Col xxs="8" s="7" l="6" style={styles.formLabel}>
                  <span>Automatic Analyze:</span>
                </Col>
                <Col xxs="16" s="15" l="14">
                  <FormBinder type="boolean" name="autoAnalyze">
                    <Switch defaultChecked={this.state.endInformation.autoAnalyze}    onChange={(values) => { this.autoChange(values); }}/>
                  </FormBinder>
                  <div style={styles.formErrorWrapper}>
                    <FormError name="autoAnalyze" />
                  </div>
                </Col>
              </Row>
              {/* Schedule */}
              <Row style={styles.formRow}>
                <Col xxs="8" s="7" l="6" style={styles.formLabel}>
                  <span>Schedule:</span>
                </Col>
                <Col xxs="16" s="15" l="14">
                  <FormBinder  validator={(rule, value, callback) => {
                        const errors = [];
                        if (this.state.endInformation.autoAnalyze) {
                          if (!value) {
                            errors.push('when you enable the autoAnalyze,you should input this cron expression ');
                          }
                        }
                        callback(errors);
                      }}>
                    <Input name="schedule" placeholder="0 0 1 ? * L" onChange={e => this.onScheduleChange(e)}  disabled={this.state.disable}  />
                  </FormBinder>
                  <div style={styles.formErrorWrapper}>
                    <FormError name="schedule" />
                  </div>
                </Col>
                <Col xxs="25" s="31" l="30">
                  <Balloon
                    trigger={clickTrigger}
                    triggerType="hover"
                  >
                    <ul>{this.state.cronData.map((db) => { return <li key={db}>{db}</li>; })}</ul>
                  </Balloon>
                </Col>
              </Row>
              {/* analyzer */}
              <Row style={styles.formRow}>
                <Col xxs="8" s="7" l="6" style={styles.formLabel}>
                  <span>Analyzer:</span>
                </Col>
                <Col xxs="16" s="15" l="14">
                  <FormBinder>
                    <CheckboxGroup dataSource={checkboxDataMap}
                      value={this.changeAnalyzeToArray(this.state.endInformation.analyzer)}
                      name="analyzer"
                      onChange={e => this.Selects(e)}
                    />
                  </FormBinder>
                </Col>
              </Row>
              {/* Data Path */}
              <Row style={styles.formRow}>
                <Col xxs="8" s="7" l="6" style={styles.formLabel}>
                  <span>Data Path:</span>
                </Col>
                <Col xxs="16" s="15" l="14">
                  <FormBinder name="dataPath" required message="Required">
                    <Input />
                  </FormBinder>
                  <div style={styles.formErrorWrapper}>
                    <FormError name="dataPath" />
                  </div>
                </Col>
              </Row>
              {/* Prefixes */}
              <Row style={styles.formRow}>
                <Col xxs="8" s="7" l="6" style={styles.formLabel}>
                  <span>Prefixes:</span>
                </Col>
                <Col xxs="16" s="15" l="14">
                  <FormBinder validator={(rule, value, callback) => {
                        const errors = [];
                        if (this.state.endInformation.analyzer.toString().indexOf(5) >= 0) {
                          if (value.trim() === '') {
                            errors.push('if you choose the ExportKeyByPrefix,you must input the prefix ');
                          }
                        }
                        callback(errors);
                      }}
                  >
                    <Input name="prefixes" multiple maxLength={1000} rows={4} />
                  </FormBinder>
                  <div style={styles.formErrorWrapper}>
                    <FormError name="prefixes" />
                  </div>
                </Col>
              </Row>
              {/* Report */}
              <Row style={styles.formRow}>
                <Col xxs="8" s="7" l="6" style={styles.formLabel}>
                  <span>Report:</span>
                </Col>
                <Col xxs="16" s="15" l="14">
                  <FormBinder type="boolean" name="report">
                    <Switch defaultChecked={this.state.endInformation.report} />
                  </FormBinder>
                  <div style={styles.formErrorWrapper}>
                    <FormError name="report" />
                  </div>
                </Col>
              </Row>
              {/* Mail */}
              <Row style={styles.formRow}>
                <Col xxs="8" s="7" l="6" style={styles.formLabel}>
                  <span>Mail:</span>
                </Col>
                <Col xxs="16" s="15" l="14">
                  <FormBinder
                    name="mailTo"
                    validator={(rule, value, callback) => {
                        const errors = [];
                        if (this.state.endInformation.report) {
                          if (value.trim() === '') {
                            errors.push('please input your email address when you want to send email');
                          }
                        }
                        callback(errors);
                      }}
                  >
                    <Input multiple maxLength={1000} rows={4} />
                  </FormBinder>
                </Col>
                <FormError name="mailTo" />
              </Row>
            </div>
          </FormBinderWrapper>
        </Dialog>
        <Dialog
          className="complex-dialog"
          style={{ width: '640px', height: '340px' }}
          autoFocus={false}
          footer={this.state.completeDialogData.status ? this.renderFooter() : this.renderFailFooter()}
          title={this.state.completeDialogData.title}
          isFullScreen
          visible={this.state.complexDialogVisible}
          closable="esc,mask,close"
          onCancel={() => { this.hideCompleteDialog(); }}
          onClose={() => { this.hideCompleteDialog(); }}
        >
          <div style={styles.dialogContent}>
            <img
              style={styles.icon}
              src={this.state.completeDialogData.imageSrc}
              alt=""
            />
            <div style={styles.info}>
              {this.state.completeDialogData.info}
            </div>
            <div style={styles.extraInfo}>
            analyze job just parse one of slaves rdb file in all masters .
            </div>
          </div>
        </Dialog>
        <Loading tip="Loading..." shape="fusion-reactor" visible={this.state.loading} style={{ width: '100%', height: '100%' }} >
          <Row wrap gutter={20}>
            <Col l="24">
              <IceContainer style={redisInfoStyle.container}>
                <h1 style={redisInfoStyle.title}>{this.state.information.name}</h1>
                <Row style={redisInfoStyle.summary}>
                  <Col span="4"><span style={redisInfoStyle.label}>Schedule: </span></Col>
                  <Col span="10" style={redisInfoStyle.value_col}>
                    <span style={redisInfoStyle.value}>
                      {this.state.information.schedule}
                    </span>
                  </Col>
                  <Col span="4" hidden />
                </Row>

                <Row style={redisInfoStyle.summary}>
                  <Col span="4"><span style={redisInfoStyle.label}>Analyzer: </span></Col>
                  <Col span="10" style={redisInfoStyle.value_col}>
                    <span style={redisInfoStyle.value}>
                      {getCheckboxData(this.changeAnalyzeToArray(this.state.information.analyzer))}
                    </span>
                  </Col>
                  <Col span="4" hidden />
                </Row>

                <Row style={redisInfoStyle.summary}>
                  <Col span="4"><span style={redisInfoStyle.label}>Data Path: </span></Col>
                  <Col span="10" style={redisInfoStyle.value_col}>
                    <span style={redisInfoStyle.value}>
                      {this.state.information.dataPath}
                    </span>
                  </Col>
                  <Col span="4" hidden />
                </Row>

                <Row style={redisInfoStyle.summary}>
                  <Col span="4"><span style={redisInfoStyle.label}>Prefixes: </span></Col>
                  <Col span="10" style={redisInfoStyle.value_col}>
                    <span style={redisInfoStyle.value}>
                      {this.state.information.prefixes}
                    </span>
                  </Col>
                  <Col span="4" hidden />
                </Row>

                <Row style={redisInfoStyle.summary}>
                  <Col span="4"><span style={redisInfoStyle.label}>Report: </span></Col>
                  <Col span="10" style={redisInfoStyle.value_col}>
                    <span style={redisInfoStyle.value}>
                      {this.state.information.report}
                    </span>
                  </Col>
                  <Col span="4" hidden />
                </Row>

                <Row style={redisInfoStyle.summary}>
                  <Col span="4"><span style={redisInfoStyle.label}>To Email: </span></Col>
                  <Col span="10" style={redisInfoStyle.value_col}>
                    <span style={redisInfoStyle.value}>
                      {this.state.information.mailTo}
                    </span>
                  </Col>
                  <Col span="4" hidden />
                </Row>

                <Row style={redisInfoStyle.summary}>
                  <Col span="4"><span style={redisInfoStyle.label}>Status: </span></Col>
                  <Col span="10" style={redisInfoStyle.value_col}>
                    <span>
                      {statusIcon}
                    </span>
                  </Col>
                  <Col span="4" hidden />
                </Row>
              </IceContainer>
            </Col>
          </Row>
          <Row style={styles.startAnalyze}>
            <Col span="10" />
            <Col span="4" />
            <Col span="2">
              <span>
                <Switch
                  style={{ position: 'absolute', width: '60px' }}
                  checkedChildren="ON"
                  unCheckedChildren="OFF"
                  checked={this.state.information.autoAnalyze}
                  onChange={(values) => { this.autoAnalyzeChange(values); }}
                  disabled={this.state.autoDiasble}
                />
              </span>
            </Col>
            <Col span="2">
              <StartAnalyze pid={this.state.information.id} handleExec={(e) => { this.handleExec(e); }} />
            </Col>
            <Col span="2">
              <Button type="primary" onClick={() => this.handleOpenEditPanel()}>
                <Icon type="survey" />{this.state.disName}
              </Button>
            </Col>
          </Row>
        </Loading>
      </div>

    );
  }
}
const redisInfoStyle = {
  container: {
    margin: '0',
    padding: '0',
  },
  title: {
    margin: '0',
    padding: '15px 20px',
    fonSize: '16px',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    color: 'rgba(0,0,0,.85)',
    fontWeight: '500',
    borderBottom: '1px solid #eee',
  },
  summary: {
    padding: '20px',
  },
  label: {
    display: 'inline-block',
    fontWeight: '500',
    minWidth: '74px',
  },
  value_col: {
    padding: 10,
    background: '#fff',
    borderBottom: '1px solid #ddd',
  },
};
const styles = {
  fromItem: {
    display: 'flex',
    alignItems: 'flex-start',
    paddingBottom: 10,
  },
  formLabel: {
    textAlign: 'left',
    lineHeight: '1.7rem',
    paddingRight: '10px',
  },
  formRow: {
    marginBottom: '20px',
  },
  input: { width: '100%' },
  formErrorWrapper: {
    marginTop: '5px',
  },
  container: {
    height: '100%',
  },
  footer: {
    marginTop: '10px',
    marginBottom: '10px',
    textAlign: 'center',
  },
  icon: {
    width: '52px',
    height: '52px',
  },
  dialogContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  info: {
    marginTop: '10px',
    fontSize: '16px',
    textAlign: 'center',
  },
  extraInfo: {
    marginTop: '12px',
    fontSize: '12px',
    color: '#999999',
  },
};

