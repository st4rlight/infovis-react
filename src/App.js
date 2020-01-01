import React from 'react';
import Map from './components/Map/Map';
import './App.css';
import Buttons from './components/Buttons/Buttons';
import TypeList from './components/TypeList/TypeList';
import axios from 'axios';
import D3 from './components/D3/D3';
import {intToTimeSpan} from './utils/utils';
import ChooseDate from './components/ChooseDate/ChooseDate';
import Analyse from './components/Analyse/Analyse';
import { Spin } from 'antd';


class App extends React.Component {
    state = {
        typedMsgs: [],
        halfTotal: [],
        types: [],
        month: 3,
        date: 1,
        half: 0,
        checked: {
            "各类诈骗": true,
            "代开发票": true,
            "办证刻章": true,
            "特殊服务": true,
            "其他广告": true,
            "房产广告": true,
            "招聘信息": true,
            "催债贷款": true,
            "赌博麻将": true,
            "造谣诽谤诅咒": true,
            "无用或丢失": true,
            "违规收分和车辆": true
        },
        showMap: false,
        analyseTime: {
            month: 3,
            date: 1
        },
        readFileFlag: false,
        readHalfFlag: false,
        readFileMsgFlag: false,
        readCalendarFlag: false
    }

    filteMsgs = () => {
        let tempArr = [];
        this.state.typedMsgs.forEach(item => {
            if(this.state.checked[item.type])
                tempArr.push(item);
        })
        return tempArr;
    }
    changeChecked = (typeName) => {
        let checked = this.state.checked;
        checked[typeName] = !checked[typeName];

        this.setState({
            checked
        }, () => {
            let tempArr = this.filteMsgs();
            //设置地图数据源，data需要是一个数组
            this.refs.map.state.pointSimplifierIns.setData(tempArr);
            //监听事件
            this.refs.map.state.pointSimplifierIns.on('pointClick pointMouseover pointMouseout', function (e, record) {});
        });
    }
    changeMonth = (month) => {
        if(this.state.month !== month){
            let date = (month === 2) ? 23 : 1;
            this.setState({
                month,
                date,
                half: 0
            })
            this.readFile(true);
        }
    }
    changeDate = (date) => {
        if(this.state.date !== date){
            this.setState({
                date
            });
            this.readFile(true);
        }
    }
    changeHalf = (half) => {
        if(this.state.half !== half){
            this.setState({
                half
            });
            this.readFile(false);
        }
    }
    changeShowMap = (showMap) => {
        this.setState({
            showMap
        });
    }
    changeAnalyseTime = (analyseTime) => {
        this.setState({
            analyseTime
        })
    }
    changeReadCalendarFlag = (readCalendarFlag) => {
        this.setState({
            readCalendarFlag
        })
    }
    cntTimeText = () => {
        return `2017年${this.state.month}月${this.state.date}日 ${intToTimeSpan(this.state.half)}`;
    }
    
    // flag代表是否重新计算halfTotal
    readFile = async (flag = true) => {
        this.setState({
            readFileFlag: true,
            readFileMsgFlag: true
        })
        axios.get(`data/month${this.state.month}/day${this.state.date}/msg${this.state.half}.txt`)
        .then((res) => {
            let typedMsgs = [];
            res.data.forEach((item) => {
                typedMsgs.push({
                    position: [
                        item["lng"], item["lat"]
                    ],
                    md5: item["md5"],
                    content: item["content"],
                    phone: item["phone"],
                    conntime: item["conntime"],
                    recitime: item["recitime"],
                    type: item["type"]
                });
            });
            
            this.setState({
                typedMsgs
            }, () => {
                let tempArr = this.filteMsgs();
                //设置地图数据源，data需要是一个数组
                this.refs.map.state.pointSimplifierIns.setData(tempArr);
                //监听事件
                this.refs.map.state.pointSimplifierIns.on('pointClick pointMouseover pointMouseout', function (e, record) {});
                this.setState({
                    readFileMsgFlag: false
                })
            });

        }).catch((err) => {
            console.log(err);
        });


        axios.get(`data/month${this.state.month}/day${this.state.date}/${this.state.half}.txt`)
        .then((res) => {
            let types = res.data;
            types.sort((a, b) => {
                return a.value < b.value;
            })
            this.setState({
                types,
                readFileFlag: false
            });
        }).catch((err) => {
            console.log(err);
        })

        // 判断是否读取half
        if(flag)
            this.readHalf();

    }

    readHalf = async () => {
        let halfTotal = [];
        this.setState({
            readHalfFlag: true
        })
        for(let i = 0; i < 48; i++){
            let cnt = 0;
            let res = await axios.get(`data/month${this.state.month}/day${this.state.date}/${i}.txt`);

            res.data.forEach((item) => {
                cnt += item.value;  
            })

            halfTotal.push(cnt);
        }

        this.setState({
            halfTotal,
            readHalfFlag: false
        });
    }

    render() {
        return (
            <div className = "App" >
                <Buttons
                    currentTime={this.cntTimeText()}
                    changeShowMap={this.changeShowMap}
                    showMap={this.state.showMap}
                    analyseTime={this.state.analyseTime}
                />
                {
                    this.state.readFileFlag || this.state.readHalfFlag || this.state.readFileMsgFlag || this.state.readCalendarFlag
                    ?
                    <div className='spin-container'>
                        <div className='my-spin'>
                            <Spin size="large" />
                        </div>
                    </div>
                    :
                    null
                }
                <div className={`map-container ${this.state.showMap ? null : 'v-show'}`}>
                    <TypeList
                        types={this.state.types}
                        checked={this.state.checked}
                        changeChecked={this.changeChecked}
                    />
                    <D3
                        halfTotal={this.state.halfTotal}
                        date={this.state.date}
                        changeHalf={this.changeHalf}
                        readHalf={this.readHalf}
                        checked={this.state.checked}
                    />
                    <Map ref="map"
                        typedMsgs={this.state.typedMsgs}
                        types={this.state.types}
                        readFile={this.readFile}
                    />
                    <ChooseDate
                        month={this.state.month}
                        date={this.state.date}
                        changeMonth={this.changeMonth}
                        changeDate={this.changeDate}
                    />
                </div>
                <div className={`analyse-container ${this.state.showMap ? 'v-show' : null}`}>
                    <Analyse
                        changeAnalyseTime={this.changeAnalyseTime}
                        changeReadCalendarFlag={this.changeReadCalendarFlag}
                    />
                </div>
            </div>
        );
    }
}

export default App;