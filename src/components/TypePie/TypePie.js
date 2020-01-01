import React, { Component } from "react";
import ReactEcharts from "echarts-for-react";
import axios from 'axios';
import './TypePie.css'

class TypePie extends Component {
  state = {
      option: {}
  }

  componentDidMount = () => {
    axios.get('data/data.json')
    .then(res => {
      let json = res.data;
      let caculate = {}
      for (let mouth in json) {
        for (let day in json[mouth]) {
          for (let data of json[mouth][day]) {
            if (Object.keys(caculate).length === 0) {
              //初始化
              for (let item of data) {
                caculate[item['type']] = 0
              }
            }
            for (let item of data) {
              caculate[item['type']] += item['value'];
            }
          }
        }
      }
      let data = [];
      for (let key in caculate) {
        data.push({ 'name': key, 'value': caculate[key] });
      }

        let option = {
            backgroundColor: '',
            tooltip: {
            trigger: "item",
                formatter: "{a} <br/>{b} : {c} ({d}%)"
            },
            legend: {
                orient: "vertical",
                left: "left",
                data: data.keys
            },
            left: 'right',
            top: 'center',
            series: [
            {
                name: "访问来源",
                type: "pie",
                radius: "55%",
                center: ["50%", "60%"],
                data: data,
                itemStyle: {
                emphasis: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: "rgba(0, 0, 0, 0.5)"
                }
                }
            }
            ]
        };

      this.setState({ option })
    });
  };

  render() {
    return (
      <React.Fragment>
        <div className='type-pie-container'>
            <ReactEcharts
                option={this.state.option}
                theme="Imooc"
                style={{height: '100%', width: '100%'}}
                opts={{
                    width: 'auto',
                    height: 'auto'
                }}
            />
        </div>
      </React.Fragment>
    );
  }
}

export default TypePie;
