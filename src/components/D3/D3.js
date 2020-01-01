import React, { Component } from 'react';
import * as d3 from 'd3';
import {intToTimeSpan} from '../../utils/utils';
import './D3.css';

export default class D3 extends Component {
    state = {
        halfTotal: []
    }

    d3Redraw = () => {
        if(JSON.stringify(this.props.halfTotal) !== JSON.stringify(this.state.halfTotal)){
            this.setState({
                halfTotal: this.props.halfTotal
            });
            
            d3.select('.d3-bottom')
                .selectAll('*')
                .remove();

            this.d3Render();
        }
    }

    d3Render = () => {
        let _this = this;
        //画布大小
        let width = 1450;
        let height = 100;

        let tooltip = d3.select("body").append("div")
            .attr("class", "tooltip") //用于css设置类样式
            .attr("opacity", 0.0);

        //在 body 里添加一个 SVG 画布
        let svg = d3.select(".d3-bottom")
            .append("svg")
            .attr("width", width)
            .attr("height", height);


        //画布周边的空白
        var padding = {left: 30, right: 30, top: 20, bottom: 20};

        //x轴的比例尺
        var xScale = d3.scale.ordinal()
            .domain(d3.range(_this.props.halfTotal.length))
            .rangeRoundBands([0, width - padding.left - padding.right]);

        //y轴的比例尺
        var yScale = d3.scale.linear()
            .domain([0, d3.max(_this.props.halfTotal)])
            .range([height - padding.top - padding.bottom, 0]);

        //定义x轴
        d3.svg.axis()
            .scale(xScale)
            .orient("bottom");

        //定义y轴
        // eslint-disable-next-line
        d3.svg.axis()
            .scale(yScale)
            .orient("left");

        //矩形之间的空白
        let rectPadding = 4;

        //添加矩形元素
        svg.selectAll(".MyRect")
            .data(_this.props.halfTotal)
            .enter()
            .append("rect")
            .on("mouseover", function (d, i) {
                d3.select(this)
                    .attr("cursor", "pointer")
                    .style("fill", "#92c9ff")
                    .attr("opacity", 1.0);

                //设置tooltip文字
                var mystr = _this.props.month + "月" + _this.props.date + "日 ";
                mystr += intToTimeSpan(i);

                tooltip.html(mystr)
                //设置tooltip的位置(left,top 相对于页面的距离)
                    .style("left", (d3.event.pageX - 50) + "px")
                    .style("top", (d3.event.pageY - 20) + "px")
                    .style("opacity", 1.0);
            })
            .on("mouseout", function (d, i) {
                d3.select(this)
                    .style("fill", "steelblue")
                    .attr("opacity", 0.2);

                tooltip.style("opacity", 0.0);

            })
            .on("click", function (d, i) {
                _this.props.changeHalf(i);
                let active = d3.select('.rect-active');
                if(active){
                    active.attr("class", null)
                          .attr("class", "MyRect")
                }

                d3.select(this)
                    .attr("cursor", "pointer")
                    .attr("class", "rect-active")
            })
            .attr("class", "MyRect")
            .attr("transform", "translate(" + padding.left + "," + padding.top + ")")
            .attr("x", function (d, i) {
                return xScale(i) + rectPadding / 2;
            })
            .attr("id", function (d, i) {
                return "rect" + i;
            })
            .attr("opacity", 0.2)
            .attr("width", xScale.rangeBand() - rectPadding)
            .attr("y", function (d) {
                var min = yScale.domain()[0];
                return yScale(min);
            })
            .attr("height", function (d) {
                return 0;
            })
            .transition()
            .delay(function (d, i) {
                return i * 5;
            })
            // .duration(100)
            // .ease("bounce")
            .attr("y", function (d) {
                return yScale(d);
            })
            .attr("height", function (d) {
                return height - padding.top - padding.bottom - yScale(d);
            });

        //添加文字元素
        svg.selectAll(".MyText")
            .data(_this.props.halfTotal)
            .enter()
            .append("text")
            .attr("class", "MyText")
            .attr("title", "test")
            .attr("transform", "translate(" + padding.left + "," + padding.top + ")")
            .attr("x", function (d, i) {
                return xScale(i) + rectPadding / 2;
            })
            .on("mouseover", function (d, i) {
                d3.select(this).attr("cursor", "pointer");

                d3.select("#rect" + i)
                    .attr("cursor", "pointer")
                    .style("fill", "#92c9ff");

                //设置tooltip文字
                var mystr = _this.props.month + "月" + _this.props.date + "日 ";
                mystr += intToTimeSpan(i);

                tooltip.html(mystr)
                //设置tooltip的位置(left,top 相对于页面的距离)
                    .style("left", (d3.event.pageX - 50) + "px")
                    .style("top", (d3.event.pageY - 20) + "px")
                    .style("opacity", 1.0);
            })
            .on("mouseout", function (d, i) {
                d3.select("#rect" + i)
                    .style("fill", "steelblue");

                tooltip.style("opacity", 0.0);
            })
            .on("click",function(d,i){
                _this.props.changeHalf(i);
            })
            .attr("dx", function () {
                return (xScale.rangeBand() - rectPadding) / 2;
            })
            .attr("dy", function (d) {
                return 12;
            })
            .text(function (d) {
                return d;
            })
            .attr("y", function (d) {
                var min = yScale.domain()[0];
                return yScale(min);
            })
            // .transition()
            // .delay(function (d, i) {
                // return i * 50;
            // })
            // .duration(250)
            // .ease("bounce")
            // .attr("y", function (d) {
                // return yScale(d);
            // });
    }


    componentDidMount(){
        this.props.readHalf();
    }
    componentDidUpdate(){
        this.d3Redraw();
    }
    
    render() {
        return (
            <div className="d3-bottom">
                {/* D3容器 */}
            </div>
        );
    }
}
