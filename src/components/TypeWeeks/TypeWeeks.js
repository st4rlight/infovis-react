import React, { Component } from 'react';
import echarts from "echarts/lib/echarts";
import './TypeWeeks.css';
import axios from 'axios';

export default class Hour24 extends Component{
    state = {
        option: {}
    }

    componentDidUpdate(){
        document.getElementById('allweeks-container').removeAttribute('_echarts_instance_');
        let bars = echarts.init(document.getElementById('allweeks-container'));
        let str = 'total';
        
        axios.get(`data/Weeks/${str}.json`)
            .then(res => {
                let data = res.data;
                let series_data = {
                    "骚扰信息": [],
                    "广告推销": [],
                    "违法信息": [],
                    "诈骗短信": []
                };
                for(let i = 0; i < 7; i++){
                    Object.keys(data[i]).forEach(key => {
                        series_data[key].push(data[i][key]);
                    });
                }
                let option_data = Object.keys(series_data).map(key => {
                    return {
                        name: key,
                        type:'line',
                        stack: '总量',
                        areaStyle: {},
                        data: series_data[key]
                    };
                });

                let option = {
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {
                            type: 'cross',
                            label: {
                                backgroundColor: '#6a7985'
                            }
                        }
                    },
                    legend: {
                        data: ["骚扰信息", "诈骗短信", "违法信息", "广告推销"],
                        itemWidth: 25,
                        itemHeight: 10,
                        itemGap: 5,
                        textStyle: {
                            fontSize: 10,
                            color: '#fff'
                        }
                    },
                    width: 'auto',
                    height: 'auto',
                    grid: {
                        left: '3%',
                        right: '4%',
                        bottom: '3%',
                        containLabel: true
                    },
                    xAxis: [
                        {
                            type : 'category',
                            boundaryGap : false,
                            data : ['周一','周二','周三','周四','周五','周六','周日'],
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
                        }
                    ],
                    yAxis: [
                        {
                            type: 'value',
                            axisLabel:{
                                color: '#fff',
                                formatter: function(value){
                                    return value / 10000 + 'w';
                                },
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
                        }
                    ],
                    series: option_data 
                };
                
                bars.setOption(option);
                bars.on('click', (params) => {
                    console.log(params);
                });  
            });
    }
    render(){
        return (
            <div id='allweeks-container'>

            </div>
        )
    }
}