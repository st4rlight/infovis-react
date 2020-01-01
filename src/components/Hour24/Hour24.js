import React, { Component } from 'react';
import echarts from "echarts/lib/echarts";
import './Hour24.css';
import axios from 'axios';

export default class Hour24 extends Component{
    state = {
        option: {}
    }

    componentDidUpdate(){
        let bars = echarts.init(document.getElementById('_24-bars-container'));
        let { month, date } = this.props.time;
        let str = `${month}${date < 10 ? '0' + date : date}`;
        let xAxis = [];
        for(let i = 0; i < 24; i++)
            xAxis.push(i);
        
        axios.get(`data/24hours/${str}.json`)
            .then(res => {
                let data = res.data;

                let option = {
                    tooltip : {
                        trigger: 'axis',
                        axisPointer : {            // 坐标轴指示器，坐标轴触发有效
                            type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
                        }
                    },
                    legend: {
                        data: ['广告推销', '诈骗短信', '违法信息', '骚扰信息'],
                        textStyle: {
                            color: '#fff'
                        }
                    },
                    grid: {
                        left: '3%',
                        right: '4%',
                        bottom: '3%',
                        containLabel: true
                    },
                    yAxis:  {
                        type: 'value',
                        axisLabel:{
                            color: '#fff'
                        },
                        axisLine:{
                            lineStyle: {
                                color: '#fff'
                            }
                        },
                        axisTick:{
                            lineStyle:{
                                color: '#fff'
                            }
                        }
                    },
                    xAxis: {
                        type: 'category',
                        data: xAxis,
                        axisLabel:{
                            color: '#fff'
                        },
                        axisLine:{
                            lineStyle: {
                                color: '#fff'
                            }
                        },
                        axisTick:{
                            lineStyle:{
                                color: '#fff'
                            }
                        }
                    },
                    width: 'auto',
                    height: 'auto',
                    series: [
                        {
                            name: '广告推销',
                            type: 'bar',
                            stack: '总量',
                            data: data['广告推销']['data']
                        },
                        {
                            name: '诈骗短信',
                            type: 'bar',
                            stack: '总量',
                            data: data['诈骗短信']['data']
                        },
                        {
                            name: '违法信息',
                            type: 'bar',
                            stack: '总量',
                            data: data['违法信息']['data']
                        },
                        {
                            name: '骚扰信息',
                            type: 'bar',
                            stack: '总量',
                            data: data['骚扰信息']['data']
                        }
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
            <div id='_24-bars-container'>

            </div>
        )
    }
}