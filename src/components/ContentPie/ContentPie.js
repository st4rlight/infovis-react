import React, { Component } from 'react';
import echarts from "echarts/lib/echarts";
import './ContentPie.css';
import axios from 'axios';

export default class ContentPie extends Component{
    state = {
        option: {}
    }

    componentDidUpdate(){
        let bars = echarts.init(document.getElementById('content-pie'));
        let { month, date } = this.props.time;
        let str = `${month}${date < 10 ? '0' + date : date}`;
        
        axios.get(`data/24hours/${str}.json`)
            .then(res => {
                let data = res.data;

                let sub_data_1 = Object.keys(data).map(key => {
                    let value = data[key]['data'].reduce((sum, curr) => {
                        return sum + curr;
                    }, 0);

                    return {
                        name: key,
                        value: value
                    };
                });
                let series_1 = {
                    center: ["50%", "60%"],
                    name: '短信类别',
                    type: 'pie',
                    selectedMode: 'single',
                    radius: [0, '30%'],
                    label: {
                        normal: {
                            position: 'inner',
                            color: 'white'
                        }
                    },
                    labelLine: {
                        normal: {
                            show: false
                        }
                    },
                    data: sub_data_1
                };


                Object.keys(data).forEach(key => {
                    delete data[key]['data'];
                });
                let sub_data_2 = [];
                Object.keys(data).forEach(key => {
                    Object.keys(data[key]).forEach(type => {
                        let value = data[key][type].reduce((total, curr) => {
                            return total + curr;
                        }, 0);
                        sub_data_2.push({
                            name: type,
                            value: value
                        });
                    });
                });
                let series_2 = {
                    name: '短信类别',
                    center: ["50%", "60%"],
                    type: 'pie',
                    selectedMode: 'single',
                    radius: ['45%',  '65%'],
                    labelLine:{  
                        normal:{  
                            length: 2
                        },
                    },
                    label: {
                        normal: {
                            textStyle: {
                                fontSize: 10,
                            }
                        }
                    },
                    data: sub_data_2
                };

                let option = {
                    width: 'auto',
                    height: 'auto',
                    tooltip: {
                        trigger: 'item',
                        formatter: "{a} <br/>{b}: {c} ({d}%)"
                    },
                    legend: {
                        orient: 'horizontal',
                        data:[
                            '各类诈骗',
                            '代开发票',
                            '办证刻章',
                            '催债贷款',
                            '特殊服务',
                            '违规收分和车辆',
                            '其他广告',
                            '房产广告',
                            '招聘信息',
                            '赌博麻将',
                            '造谣诽谤诅咒',
                            '无用或丢失'
                        ],
                        itemWidth: 10,
                        itemHeight: 5,
                        itemGap: 5,
                        textStyle: {
                            fontSize: 10,
                            color: '#fff'
                        }
                    },
                    labelLine:{  
                        normal:{  
                            length:5,  // 改变标示线的长度
                        },
                    },
                    series: [
                        series_1,
                        series_2
                    ]
                };

                bars.setOption(option);
                bars.on('click', (params) => {
                    console.log(params);
                });  
            });
    }
    render(){
        return (
            <div id='content-pie'>

            </div>
        )
    }
}