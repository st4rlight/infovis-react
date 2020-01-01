import React, { Component } from 'react';
import './Analyse.css';
import WordCloud from '../WordCloud/WordCloud';
// import TypePie from '../TypePie/TypePie';
// import Histogram from '../Histogram/Histogram';
import Calendar from '../Calendar/Calendar';
import HeatMap from '../HeatMap/HeatMap';
import Hour24 from '../Hour24/Hour24';
import ContentPie from '../ContentPie/ContentPie';
import TypeWeeks from '../TypeWeeks/TypeWeeks';
import ContentList from '../ContentList/ContentList';
import MapCnt from '../MapCnt/MapCnt';
import LocationsPie from '../LocationsPie/LocationsPie';
// import MyHeatMap from '../MyHeatMap/MyHeatMap';

export default class Analyse extends Component{
    state = {
        time: {
            month: 3,
            date: 1
        }
    }
    changeTime = (analyseTime) => {
        this.setState({
            time: analyseTime
        })
        this.props.changeAnalyseTime({
            ...analyseTime
        })
    }

    render(){
        return(
            <div className='analyse-wrapper'>
                <div className='top-wrapper'>
                    <div className='top-left'>
                        <div className='word-cloud'>
                            <WordCloud
                                time={this.state.time}
                            />
                        </div>
                        <div className='locations'>
                            <LocationsPie
                                time={this.state.time}
                            />
                        </div>
                    </div>
                    <div className='top-center'>
                        <MapCnt
                            time={this.state.time}
                        />
                        
                        {/* <MyHeatMap
                            time={this.state.time}
                        /> */}
                    </div>
                    <div className='top-right'>
                        <div className='calendar'>
                            <Calendar
                                changeTime={this.changeTime}
                            />
                        </div>
                        <div className='periods'>
                            <HeatMap
                                time={this.state.time}
                            />
                        </div>
                    </div>
                </div>
                <div className='bottom-wrapper'>
                    <div className='bottom-1th'>
                        <TypeWeeks
                            time={this.state.time}
                        />
                    </div>
                    <div className='bottom-2th'>
                        <ContentPie
                            time={this.state.time}
                        />
                    </div>
                    <div className='bottom-3th'>
                        <ContentList
                            time={this.state.time}
                        />
                    </div>
                    <div className='bottom-4th'>
                        <Hour24
                            time={this.state.time}
                        />
                    </div>
                </div>

                {/* <HeatMap /> */}
            </div>
        )
    }
}