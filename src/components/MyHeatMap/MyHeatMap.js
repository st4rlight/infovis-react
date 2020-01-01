import React, { Component } from 'react';
import echarts from "echarts/lib/echarts";
import './MyHeatMap.css';
import axios from 'axios';

export default class MyHeatMap extends Component{
    componentDidUpdate(){
        let heatMap = echarts.init(document.getElementById('my-heat-map-container'));
        let { month, date } = this.props.time;
        let str = `${month}${date < 10 ? '0' + date : date}`;
        

        axios.get(`data/HeatMap/${str}.json`)
            .then(res => {
                let data = res.data;
                let points = [[]];
                let _min = 9999999;
                let _max = 0;

                Object.keys(data).forEach(item => {
                    Object.keys(data[item]).forEach(key => {
                        points[0].push({
                            coord: [parseFloat(item), parseFloat(key)],
                            elevation: data[item][key]
                        });

                        _min = Math.min(_min, data[item][key]);
                        _max = Math.max(_max, data[item][key]);
                    });
                });

                points = [].concat.apply([], points.map(function (track) {
                    return track.map(function (seg) {
                        return seg.coord.concat([1]);
                    });
                }));

                let option = {
                    animation: true,
                    bmap: {
                        center: [116.380009, 39.915212],
                        zoom: 12,
                        roam: true,
                        show: true,
                        features: ["road", "building", "water", "land"],//隐藏地图上的"poi",
                        style: "dark",
                    },
                    height: 'auto',
                    width: 'auto',
                    visualMap: {
                        show: false,
                        top: 'top',
                        min: 0,
                        max: 5,
                        seriesIndex: 0,
                        calculable: true,
                        inRange: {
                            color: ['blue', 'blue', 'green', 'yellow', 'red']
                        }
                    },
                    series: [{
                        type: 'heatmap',
                        coordinateSystem: 'bmap',
                        data: points,
                        pointSize: 5,
                        blurSize: 6
                    }]
                }

                heatMap.setOption(option);
            });
    }
    render(){
        return (
            <div id='my-heat-map-container'>

            </div>
        )
    }
}