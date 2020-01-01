import React, { Component } from "react";
import echarts from "echarts/lib/echarts";
import axios from 'axios';
import './HeatMap.css';

class Heatmap extends Component {
    componentDidMount = () => {
        document.getElementById('allweeks-container').removeAttribute('heat-container');
        let heat = echarts.init(document.getElementById('heat-container')); 

        axios.get("data/data.json")
            .then(res => {
                let json = res.data;
                let hours = [];
                for(let i = 0; i < 24; i++)
                    hours.push(i);

                let days = [
                    "周六",
                    "周五",
                    "周四",
                    "周三",
                    "周二",
                    "周一",
                    "周日"
                ].reverse();

                // 数据,获取周一至周日每天每个时间段的平均垃圾信息数量
                var tempDate = 3;
                let sumMes = new Array(7).fill(0).map(() => new Array(24).fill(0)); //周x第y时垃圾短信总数
                let dateNum = new Array(7).fill(0);

                let name = {};
                for (let i in json) {
                    name[i] = [];
                    let k = 0;
                    for (let j in json[i]) name[i][k++] = j;
                }
                for (let i in name) {
                    name[i].sort((a, b) => {
                        return parseInt(a.substring(3)) - parseInt(b.substring(3));
                    });
                }
                for (let month in json) {
                    for (let j = 0; j < name[month].length; ++j) {
                        let day = name[month][j];
                        tempDate++;
                        let date = tempDate % 7; //求出星期几
                        dateNum[date]++;
                        let i = 0; //i为每天第几个小时
                        //遍历每天不同时间段
                        let flag = 0;
                        for (let data of json[month][day]) {
                            let temp = 0;
                            if (flag === 1) {
                                flag = 0;
                                for (let item of data) {
                                    sumMes[date][i] += temp + item.value;
                                    temp = 0;
                                }
                                i++;
                            } else {
                                for (let item of data) {
                                    temp += item.value;
                                }
                                flag++;
                            }
                        }
                    }
                }
                var data = [];
                let i = 0;
                sumMes.forEach((day, index) => {
                    day.forEach((item, index1) => {
                        item = Math.floor(item / dateNum[index]);
                        data[i++] = [index, index1, item];
                    });
                });
                data = data.map(function (item) {
                    return [item[1], item[0], item[2] || "-"];
                });


                let option = {
                    tooltip: {},
                    animation: true,
                    grid: {
                        // height: "50%",
                        // y: "10%"
                        top: '10%',
                        left: '3%',
                        right: '10%',
                        bottom: '10%',
                        containLabel: true
                    },
                    xAxis: {
                        type: "category",
                        data: hours,
                        splitArea: {
                            show: true
                        },
                        axisLabel: {
                            color: '#fff'
                        },
                        axisLine: {
                            lineStyle: {
                                color: '#fff'
                            }
                        },
                        axisTick: {
                            lineStyle: {
                                color: '#fff'
                            }
                        }
                    },
                    yAxis: {
                        type: "category",
                        data: days,
                        splitArea: {
                            show: true
                        },
                        axisLabel: {
                            color: '#fff'
                        },
                        axisLine: {
                            lineStyle: {
                                color: '#fff'
                            }
                        },
                        axisTick: {
                            lineStyle: {
                                color: '#fff'
                            }
                        }
                    },
                    visualMap: {
                        min: 10,
                        max: 1500,
                        orient: "vertical",
                        left: "right",
                        top: "bottom",

                        // inRange: {
                        //     color: ['#fff', '#bf4448'], 
                        // },
                        textStyle: {
                            color: '#fff'
                        }
                    },
                    series: [{
                        name: "该时段垃圾短信平均量",
                        type: "heatmap",
                        data: data,
                        label: {
                            normal: {
                                show: false
                            }
                        },
                        itemStyle: {
                            emphasis: {
                                shadowBlur: 10,
                                shadowColor: "rgba(0, 0, 0, 0.5)"
                            }
                        }
                    }]
                };

                heat.setOption(option);
                heat.on('click', (params) => {
                    console.log(params);
                });
            });
    };

    render() {
        return ( 
            <div id='heat-container'>
            
            </div>
        );
    }
}

export default Heatmap;