import React, { Component } from 'react';
import echarts from "echarts/lib/echarts";
import './Calendar.css';
import axios from 'axios';

export default class Calendar extends Component{
    state = {
        option: {}
    }

    componentDidMount(){
        let myCal = echarts.init(document.getElementById('calendar-container'));
        var dateList = [
            ['2017-2-23', '廿七'],
            ['2017-2-24', '廿八'],
            ['2017-2-25', '廿九'],
            ['2017-2-26', '二月'],
            ['2017-2-27', '初二'],
            ['2017-2-28', '初三'],
            ['2017-3-1', '初四'],
            ['2017-3-2', '初五'],
            ['2017-3-3', '初六'],
            ['2017-3-4', '初七'],
            ['2017-3-5', '初八', '驚蟄'],
            ['2017-3-6', '初九'],
            ['2017-3-7', '初十'],
            ['2017-3-8', '十一'],
            ['2017-3-9', '十二'],
            ['2017-3-10', '十三'],
            ['2017-3-11', '十四'],
            ['2017-3-12', '十五'],
            ['2017-3-13', '十六'],
            ['2017-3-14', '十七'],
            ['2017-3-15', '十八'],
            ['2017-3-16', '十九'],
            ['2017-3-17', '二十'],
            ['2017-3-18', '廿一'],
            ['2017-3-19', '廿二'],
            ['2017-3-20', '廿三', '春分'],
            ['2017-3-21', '廿四'],
            ['2017-3-22', '廿五'],
            ['2017-3-23', '廿六'],
            ['2017-3-24', '廿七'],
            ['2017-3-25', '廿八'],
            ['2017-3-26', '廿九'],
            ['2017-3-27', '三十'],
            ['2017-3-28', '三月'],
            ['2017-3-29', '初二'],
            ['2017-3-30', '初三'],
            ['2017-3-31', '初四'],
            ['2017-4-1', '初五'],
            ['2017-4-2', '初六'],
            ['2017-4-3', '初七'],
            ['2017-4-4', '初八', '清明'],
            ['2017-4-5', '初九'],
            ['2017-4-6', '初十'],
            ['2017-4-7', '十一'],
            ['2017-4-8', '十二'],
            ['2017-4-9', '十三'],
            ['2017-4-10', '十四'],
            ['2017-4-11', '十五'],
            ['2017-4-12', '十六'],
            ['2017-4-13', '十七'],
            ['2017-4-14', '十八'],
            ['2017-4-15', '十九'],
            ['2017-4-16', '二十'],
            ['2017-4-17', '廿一'],
            ['2017-4-18', '廿二'],
            ['2017-4-19', '廿三'],
            ['2017-4-20', '廿四', '穀雨'],
            ['2017-4-21', '廿五'],
            ['2017-4-22', '廿六'],
            ['2017-4-23', '廿七'],
            ['2017-4-24', '廿八'],
            ['2017-4-25', '廿九'],
            ['2017-4-26', '四月']
        ];
        
        var lunarData = [];
        for (var i = 0; i < dateList.length; i++) {
            lunarData.push([
                dateList[i][0],
                1,
                dateList[i][1],
                dateList[i][2]
            ]);
        }
        
        axios.get('data/Calendar/total.json')
            .then(res => {
                let heatMapData = [];
                Object.keys(res.data).forEach(key => {
                    let data = [];
                    data.push(`2017-0${key[0]}-${key.substring(1)}`);
                    data.push(res.data[key]);

                    heatMapData.push(data);
                });
                let option = {
                    tooltip : {},
                    legend: {
                        show: false  
                    },
                    calendar: {
                        // itemStyle: {
                        //     normal: {
                        //         borderColor: '#fff'
                        //     }
                        // },
                        // splitLine: {
                        //     lineStyle: {
                        //         color: '#fff'
                        //     }
                        // },
                        top: 'bottom',
                        left: 'center',
                        orient: 'horizontal',
                        width: '80%',
                        height: '85%',
                        yearLabel: {
                            show: false
                        },
                        dayLabel: {
                            firstDay: 1,
                            nameMap: 'cn',
                            textStyle: {
                                color: '#fff'
                            }
                        },
                        monthLabel: {
                            nameMap: 'cn',
                            textStyle: {
                                color: '#fff'
                            }
                        },
                        range: ['2017-02-23', '2017-04-26']
                    },
                    visualMap: {
                        min: 10000,
                        max: 150000,
                        type: 'continuous',
                        left: 'right',
                        top: 'bottom',
                        seriesIndex: [1],
                        orient: 'vertical',
                        inRange: {
                            color: ['#fff', '#bf4448'], 
                        },
                        textStyle: {
                            color: '#fff'
                        }
                    },
                    series: [{
                        type: 'graph',
                        edgeSymbol: ['none', 'arrow'],
                        coordinateSystem: 'calendar',
                        calendarIndex: 0,
                        itemStyle: {
                            normal: {
                                // color: 'yellow',
                                shadowBlue: 9,
                                shadowOffsetX: 1.5,
                                shadowOffsetY: 3,
                                // shadowColor: '#555'
                            }
                        },
                    }, {
                        type: 'heatmap',
                        coordinateSystem: 'calendar',
                        data: heatMapData
                    },
                    {
                        type: 'scatter',
                        coordinateSystem: 'calendar',
                        symbolSize: 1,
                        label: {
                            normal: {
                                show: true,
                                formatter: function (params) {
                                    var d = echarts.number.parseDate(params.value[0]);
                                    return d.getDate();
                                },
                                textStyle: {
                                    color: '#000'
                                }
                            }
                        },
                        data: lunarData
                    }]
                };
                
                myCal.setOption(option);
                myCal.on('click', (params) => {
                    let month = parseInt(params.data[0].substr(5, 2));
                    let  date = parseInt(params.data[0].substr(8, 2));
                    this.props.changeTime({
                        month: month,
                         date: date
                    });
                });  
            });
    }
    render(){
        return (
            <div id='calendar-container'>

            </div>
        )
    }
}