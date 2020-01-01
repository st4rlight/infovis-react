import React, { Component } from 'react';
import { Button, Timeline } from 'antd';
import './ChooseDate.css';

export default class ChooseDate extends Component {
    changeMonth(month){
        this.props.changeMonth(month);
    }
    changeDate(date){
        this.props.changeDate(date);
    }


    render() {
        let startDate = 0;
        let endDate = 0;

        if (this.props.month === 2) {
            startDate = 23;
            endDate = 28;
        } else if (this.props.month === 3) {
            startDate = 1;
            endDate = 31;
        } else {
            startDate = 1;
            endDate = 26;
        }

        return (
            <div className="month-date">
                <div className="month">
                <Button type="dashed" ghost
                        className={this.props.month === 2 ? "month-button-active" : null}
                        onClick={this.changeMonth.bind(this, 2)}
                >
                    二月
                </Button>
                <Button type="dashed" ghost
                        className={this.props.month === 3 ? "month-button-active" : null}
                        onClick={this.changeMonth.bind(this, 3)}
                >
                    三月
                </Button>
                <Button type="dashed" ghost
                        className={this.props.month === 4 ? "month-button-active" : null}
                        onClick={this.changeMonth.bind(this, 4)}
                >
                    四月
                </Button>
                </div>
                <div className="timeline-container">
                    <Timeline pending={false} className="date-time-line" mode="right">
                        {
                            (() => {
                                let timeline = [];
                                for(let i = startDate; i <= endDate; i++){
                                    timeline.push(
                                        <Timeline.Item
                                            key={i}
                                            onClick={this.changeDate.bind(this, i)}
                                            className={this.props.date === i ? "timeline-active" : null}
                                            color={this.props.date === i ? "blue" : "gray"}
                                        >
                                                {i}
                                        </Timeline.Item>
                                    );
                                }
                                return timeline;
                            })()
                        }
                    </Timeline>
                </div>
            </div>
        );
    }
}
