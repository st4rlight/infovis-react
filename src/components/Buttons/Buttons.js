import React, { Component } from 'react';
import './Buttons.css'

export default class Buttons extends Component {
  changeButton(flag, e){
      this.props.changeShowMap(flag);
  }

  render() {
    let { month, date } = this.props.analyseTime
    let str = `2017年${month < 10 ? '0' + month : month}月${date < 10 ? '0' + date : date}日`

    return (
        <div className="buttons">
            <div className="center-box">
                <div className="flex-box">
                    <div>
                        <button data-name="map"
                                onClick={this.changeButton.bind(this, true)}
                                className={`button button-normal button-plain button-border button-box ${this.props.showMap ? "button-focus" : null}`}>
                            <i className="fa fa-map-marker" aria-hidden="true"></i>
                        </button>
                        <span className="button-space"></span>
                        <button data-name="charts"
                                onClick={this.changeButton.bind(this, false)}
                                className={`button button-normal button-plain button-border button-box ${!this.props.showMap ? "button-focus" : null}`}>
                                    <i className="fa fa-bar-chart" aria-hidden="true"></i>
                        </button>
                    </div>
                        <div className={`time ${!this.props.showMap ? 'analyse-time' : ''}`}>
                            当前时间：
                            {
                                this.props.showMap
                                ?
                                this.props.currentTime
                                :
                                str
                            }
                        </div>
                </div>
            </div>
      </div>
    );
  }
}