import React, { Component } from 'react';
import echarts from "echarts/lib/echarts";
import './LocationsPie.css';
import axios from 'axios';

export default class LocationsPie extends Component{
    state = {
        option: {}
    }

    componentDidUpdate(){
        let mapCnt = echarts.init(document.getElementById('locations-pie'));
        let { month, date } = this.props.time;
        let str = `${month}${date < 10 ? '0' + date : date}`;
        let _min = 9999999;
        let _max = 0;
        


        axios.get(`data/NewLocations/${str}.json`)
            .then(res => {
                let data = res.data;
                let arr = [];
                Object.keys(data).forEach(key => {
                    arr.push({
                        name: key,
                        value: data[key].cnt
                    });
                    _min = Math.min(data[key].cnt, _min);
                    _max = Math.max(data[key].cnt, _max);
                });
                arr = arr.sort((a, b) => {
                    return b.value - a.value;
                }).slice(0, 8);

                let option = {
                    tooltip: {
                        trigger: 'item',
                        formatter: "{a} <br/>{b} : {c}"
                    },
                    top: 'center',
                    calculable: true,
                    series: [
                        {
                            name: '各区数量',
                            type:'funnel',
                            height: '90%',
                            top: 'center',
                            label: {
                                normal: {
                                    position: 'right'
                                }
                            },
                            data: arr
                        }
                    ]
                };
                
                
                mapCnt.setOption(option);
                mapCnt.on('click', (params) => {
                    console.log(params);
                });  
            });

    }
    render(){
        return (
            <div id='locations-pie'>

            </div>
        )
    }
}