import React, { Component } from 'react';
import echarts from "echarts/lib/echarts";
import './MapCnt.css';
import axios from 'axios';

export default class MapCnt extends Component{
    state = {
        option: {}
    }

    componentDidUpdate(){
        let mapCnt = echarts.init(document.getElementById('map-cnt'));
        let { month, date } = this.props.time;
        let str = `${month}${date < 10 ? '0' + date : date}`;
        let _min = 9999999;
        let _max = 0;
        
        axios.get('data/beijing.json')
            .then(res => {
                echarts.registerMap('beijing', res.data);
                // mapCnt.hideLoading();

                axios.get(`data/NewLocations/${str}.json`)
                .then(response => {
                    let data = response.data;

                    let point_data = [];
                    Object.keys(data).forEach(key => {
                        _min = Math.min(data[key].cnt, _min);
                        _max = Math.max(data[key].cnt, _max);

                        point_data.push({
                            name: key,
                            value: [...data[key].center, data[key].cnt]
                        })
                    });
                    point_data.sort((a, b) => {
                        return b.value[2] - a.value[2]; 
                    });

                    let option = {
                        backgroundColor: 'transparent',
                        tooltip : {
                            trigger: 'item',
                            formatter: function(params){
                                return params.seriesName + '<br/>' + params.marker + " " + params.data.name + ': ' + params.data.value[2];
                            }
                        },
                        geo: {
                            map: 'beijing',
                            label: {
                                normal: {
                                    show: false
                                },
                                emphasis: {
                                    show: false,
                                }
                            },
                            zoom: 1.2,
                            left: 'center',
                            roam: true,
                            itemStyle: {
                                normal: {
                                    areaColor: '#323C48',
                                    borderColor: 'white',
                                    borderWidth: 1,
                                },
                                emphasis: {
                                    areaColor: '#4A7DE6',
                                }
                            }
                        },
                        series: [
                            {
                                name: '各区总数',
                                type: 'effectScatter',
                                coordinateSystem: 'geo',
                                data: point_data,
                                symbolSize: function (val) {
                                    return 10 + (50 * val[2] / (_max - _min));
                                },
                                showEffectOn: 'render',
                                rippleEffect: {
                                    brushType: 'stroke'
                                },
                                hoverAnimation: true,
                                label: {
                                    normal: {
                                        formatter: '{b}',
                                        position: 'bottom',
                                        show: true
                                    }
                                },
                                itemStyle: {
                                    normal: {
                                        color: function(e){
                                            let colors = ['#ff6D00', '#bde489', '#a4dbbb', '#9ad3dc', '#83d0ec'];
                                            switch(e.dataIndex){
                                                case 0:
                                                    return colors[0];
                                                case 1:
                                                case 2:
                                                    return colors[1];
                                                case 3:
                                                case 4:
                                                    return colors[2];
                                                case 5:
                                                case 6:
                                                    return colors[3];
                                                default:
                                                    return colors[4];                           
                                            }
                                        }
                                    }
                                },
                                zlevel: 1
                            }
                        ]
                    };
    
                    mapCnt.setOption(option);
                    mapCnt.on('click', (params) => {
                        console.log(params);
                    });  
                });
            });



    }
    render(){
        return (
            <div id='map-cnt'>

            </div>
        )
    }
}