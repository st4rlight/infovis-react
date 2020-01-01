import React, { Component } from "react";
import ReactEcharts from "echarts-for-react";
import echarts from "echarts/lib/echarts";
import axios from 'axios';
import './Histogram.css'

class Histogram extends Component {
    state = {
        option: {}
    }

  resolveOption = () => {
    axios.get("data/data.json")
      .then(res => {
        let json = res.data;

        let category = [];
        let average = [];
        let max = [];
        let sumData = [];
        let sumDay = 0;
        // category
        let pre = 0;
        let i = 0;
        while (i < 48) {
          if (i % 2 === 0) {
            category.push((pre < 10 ? "0" + pre : pre) + ":00");
          } else {
            category.push((pre < 10 ? "0" + pre : pre) + ":30");
            pre++;
          }
          i++;
        }
        for (let month in json) {
          for (let day in json[month]) {
            if (json[month][day].length > 0) {
              sumDay++;
              if (sumData.length === 0) {
                sumData = new Array(json[month][day].length).fill(0);
                max = new Array(json[month][day].length).fill(0);
              }
              json[month][day].forEach((item, idx) => {
                let sum = 0;
                for (let d of item) {
                  sum += d["value"];
                }
                sumData[idx] += sum;
                if (sum > max[idx]) {
                //   console.log(month, day, idx, item, sum);
                }
                max[idx] = Math.max(max[idx], sum);
              });
            }
          }
        }

        for (let sum of sumData) {
          average.push(sum / sumDay);
        }
        // option
        let option = {
          backgroundColor: "#0f375f",
          tooltip: {
            trigger: "axis",
            axisPointer: {
              type: "shadow"
            }
          },
          legend: {
            data: ["line", "bar"],
            textStyle: {
              color: "#ccc"
            }
          },
          xAxis: {
            data: category,
            axisLine: {
              lineStyle: {
                color: "#ccc"
              }
            }
          },
          yAxis: {
            splitLine: { show: false },
            axisLine: {
              lineStyle: {
                color: "#ccc"
              }
            }
          },
          series: [
            {
              name: "line",
              type: "line",
              smooth: true,
              showAllSymbol: true,
              symbol: "emptyCircle",
              symbolSize: 15,
              data: max
            },
            {
              name: "bar",
              type: "bar",
              barWidth: 10,
              itemStyle: {
                normal: {
                  barBorderRadius: 5,
                  color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: "#14c8d4" },
                    { offset: 1, color: "#43eec6" }
                  ])
                }
              },
              data: average
            },
            {
              name: "bar",
              type: "bar",
              barGap: "-100%",
              barWidth: 10,
              itemStyle: {
                normal: {
                  color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: "rgba(20,200,212,0.5)" },
                    { offset: 0.2, color: "rgba(20,200,212,0.2)" },
                    { offset: 1, color: "rgba(20,200,212,0)" }
                  ])
                }
              },
              z: -12,
              data: max
            },
            {
              name: "dotted",
              type: "pictorialBar",
              symbol: "rect",
              itemStyle: {
                normal: {
                  color: "#0f375f"
                }
              },
              symbolRepeat: true,
              symbolSize: [12, 4],
              symbolMargin: 1,
              z: -10,
              data: max
            }
          ]
        };
        this.setState({ option });
      });
  };
  
  componentWillMount() {
    //主题的设置要在willmounted中设置
    // echarts.registerTheme("Imooc", echartTheme);
    this.resolveOption();
  }

  render() {
    return (
      <React.Fragment>
        <div className='histogram-container'>
          <ReactEcharts
            option={this.state.option}
            theme="Imooc"
            style={{height: '100%', width: '100%'}}
          />
        </div>
      </React.Fragment>
    );
  }
}

export default Histogram;
