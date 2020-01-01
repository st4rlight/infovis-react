import React, { Component } from 'react';
import axios from 'axios';
import { ScrollBoard } from '@jiaminghi/data-view-react'
import './ContentList.css'

export default class WordCloud extends Component {
    state = {
        config: {
            data: [],
            index: true,
            align: ['center'],
            waitTime: 3000,
            carousel: 'single'
        }
    }
    componentWillReceiveProps(nextProps){
        let { month, date } = nextProps.time;
        let str = `${month}${date < 10 ? '0' + date : date}.json`;

        axios.get(`data/MostMD5/${str}`)
            .then(res => {
                let data = res.data;
                let config = {
                    data: [],
                    index: true,
                    columnWidth: [30, 200],
                    waitTime: 3000,
                    carousel: 'single'
                }
                config.data = data.map(item => {
                    return [
                        `<div class='item-content'>${item.value.content}</div>`,
                        item.value.cnt
                    ];
                });

                this.setState({
                    config
                });
            });

        return null;
    }

    render() {
        return (
            <div id='content-list'>
                <ScrollBoard
                    config={this.state.config}
                />
            </div>
        )
    }
}