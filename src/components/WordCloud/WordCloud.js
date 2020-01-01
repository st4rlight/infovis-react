import React, { Component } from 'react';
import 'echarts-wordcloud';
import echarts from 'echarts';
import axios from 'axios';
import './WordCloud.css'

export default class WordCloud extends Component {
    componentDidUpdate(){
        let wordcloud = echarts.init(document.getElementById('word-cloud'));
        var maskImage = new Image();

        //云彩图片的base64码
        maskImage.src = 'data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTYuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgd2lkdGg9IjI1NnB4IiBoZWlnaHQ9IjI1NnB4IiB2aWV3Qm94PSIwIDAgNTQ4LjE3NiA1NDguMTc2IiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1NDguMTc2IDU0OC4xNzY7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPGc+Cgk8cGF0aCBkPSJNNTI0LjE4MywyOTcuMDY1Yy0xNS45ODUtMTkuODkzLTM2LjI2NS0zMi42OTEtNjAuODE1LTM4LjM5OWM3LjgxLTExLjk5MywxMS43MDQtMjUuMTI2LDExLjcwNC0zOS4zOTkgICBjMC0yMC4xNzctNy4xMzktMzcuNDAxLTIxLjQwOS01MS42NzhjLTE0LjI3My0xNC4yNzItMzEuNDk4LTIxLjQxMS01MS42NzUtMjEuNDExYy0xOC4yNzEsMC0zNC4wNzEsNS45MDEtNDcuMzksMTcuNzAzICAgYy0xMS4yMjUtMjcuMDI4LTI5LjA3NS00OC45MTctNTMuNTI5LTY1LjY2N2MtMjQuNDYtMTYuNzQ2LTUxLjcyOC0yNS4xMjUtODEuODAyLTI1LjEyNWMtNDAuMzQ5LDAtNzQuODAyLDE0LjI3OS0xMDMuMzUzLDQyLjgzICAgYy0yOC41NTMsMjguNTQ0LTQyLjgyNSw2Mi45OTktNDIuODI1LDEwMy4zNTFjMCwyLjg1NiwwLjE5MSw2Ljk0NSwwLjU3MSwxMi4yNzVjLTIyLjA3OCwxMC4yNzktMzkuODc2LDI1LjgzOC01My4zODksNDYuNjg2ICAgQzYuNzU5LDI5OS4wNjcsMCwzMjIuMDU1LDAsMzQ3LjE4YzAsMzUuMjExLDEyLjUxNyw2NS4zMzMsMzcuNTQ0LDkwLjM1OWMyNS4wMjgsMjUuMDMzLDU1LjE1LDM3LjU0OCw5MC4zNjIsMzcuNTQ4aDMxMC42MzYgICBjMzAuMjU5LDAsNTYuMDk2LTEwLjcxNSw3Ny41MTItMzIuMTIxYzIxLjQxMy0yMS40MTIsMzIuMTIxLTQ3LjI0OSwzMi4xMjEtNzcuNTE1ICAgQzU0OC4xNzIsMzM5Ljc1Nyw1NDAuMTc0LDMxNi45NTIsNTI0LjE4MywyOTcuMDY1eiIgZmlsbD0iI0ZGRkZGRiIvPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+Cjwvc3ZnPgo=';
        maskImage.onload = () => {
            let { month, date } = this.props.time;
            let str = month + '' + (date < 10 ? '0' + date : date);
            let colors = ['#91c7ae', '#749f83', '#c23531', '#bda29a', '#ca8622', '#61a0a8', '#2f4554', '#d48265', '#6e7074', '#c4ccd3', '#546470', '#6e7074'];
            let ii = 0;
            function getColor(){
                return colors[(ii++ % colors.length)];
            }

            axios.get(`data/WordCloud/${str}.json`)
                .then(res => {
                    let data = [];
                    res.data.forEach(item => {
                        data.push({ 'name': item.key, 'value': item.value});
                    })
                    wordcloud.setOption({
                        tooltip: {
                            trigger: 'item',
                            position: 'inside'
                        },
                        height: 'auto',
                        width: 'auto',
                        series: [{
                            type: 'wordCloud',
                            gridSize: 2,
                            sizeRange: [10, 40],
                            // Text rotation range and step in degree. Text will be rotated randomly in range [-90,                                                                             90] by rotationStep 45
        
                            rotationRange: [-45, 0, 45, 90],
                            //maskImage: maskImage,
                            textStyle: {
                                normal: {
                                    color: getColor
                                    // function () {
                                    //     return 'rgb(' +
                                    //         Math.round(Math.random() * 255) +
                                    //         ', ' + Math.round(Math.random() * 255) +
                                    //         ', ' + Math.round(Math.random() * 255) + ')'
                                    // }
                                }
                            },
                            // Folllowing left/top/width/height/right/bottom are used for positioning the word cloud
                            // Default to be put in the center and has 75% x 80% size.
                            left: 'center',
                            top: 'center',
                            right: null,
                            bottom: null,
                            width: '85%',
                            height: '85%',
                            data: data
                        }]
                    });
                });
        }
    }

    render() {
        return (
            <div id='word-cloud'>

            </div>
        )
    }
}