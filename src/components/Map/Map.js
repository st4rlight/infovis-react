import React, { Component } from 'react';
import AMapJS from 'amap-js';
import {colors} from '../../utils/utils';
import './Map.css';

export default class Map extends Component {
    state = {
        pointSimplifierIns: ''
    }

    componentDidMount() {
        const aMapJSAPILoader = new AMapJS.AMapJSAPILoader({
            v: "1.4.15",
            key: "3f2fa208ed7c76b2cbbb225794c5e4ce"
        });

        const aMapUILoader = new AMapJS.AMapUILoader({
            v: "1.0" // UI组件库版本号
        });

        aMapJSAPILoader.load().then(AMap => {
            aMapUILoader.load().then(initAMapUI => {
                const AMapUI = initAMapUI(); // 这里调用initAMapUI初始化并返回AMapUI

                //高德地图对象
                let map = new AMap.Map('container', {
                    zoom: 11,
                    center: [116.403909, 39.915212]
                });

                //设置高德地图的主题和特性
                map.setMapStyle('amap://styles/grey');
                map.setFeatures(['road', 'bg']); //多个种类要素显示

                let initPage = (PointSimplifier) => {
                    //创建组件实例
                    let pointSimplifierIns = new PointSimplifier({
                        map: map, //关联的map
                        compareDataItem: function (a, b, aIndex, bIndex) {
                            //数据源中靠后的元素优先，index大的排到前面去
                            return aIndex > bIndex ? -1 : 1;
                        },
                        getPosition: function (dataItem) {
                            //返回数据项的经纬度，AMap.LngLat实例或者经纬度数组
                            return dataItem.position;
                        },
                        getHoverTitle: function (dataItem, idx) {
                            //返回数据项的Title信息，鼠标hover时显示
                            return dataItem["content"];
                        },

                        //使用GroupStyleRender
                        autoSetFitView: false,
                        renderConstructor: PointSimplifier.Render.Canvas.GroupStyleRender,
                        renderOptions: {
                            //点的样式
                            pointStyle: {
                                fillStyle: 'red'
                                //                            width: 5,
                                //                            height: 5
                            },
                            getGroupId: (dataitem, idx) => {
                                //按照类型分组
                                return dataitem["type"];

                            },
                            groupStyleOptions: (gid) => {
                                //                            var size = 4;
                                return {
                                    pointStyle: {
                                        fillStyle: colors[gid],
                                        width: 5,
                                        height: 5
                                    }
                                };
                            }

                        }
                    });


                    this.setState({
                        pointSimplifierIns
                    }, () => {
                        this.props.readFile(false);
                    });
                }

                //加载PointSimplifier，loadUI的路径参数为模块名中 'ui/' 之后的部分 
                AMapUI.loadUI(['misc/PointSimplifier'], function (PointSimplifier) {
                    //不支持的话提示错误信息
                    if (!PointSimplifier.supportCanvas) {
                        alert('当前环境不支持 Canvas！');
                        return;
                    }

                    //启动页面
                    initPage(PointSimplifier);
                });
            });
        })
    }

    render() {
        return (
            // <高德地图容器
            <div id = "container" >

            </div>
        );
    }
}