import React, { Component } from 'react';
import {colors} from '../../utils/utils';

import './TypeList.css';

export default class TypeList extends Component {

    changeChecked(typeName){
        this.props.changeChecked(typeName);
    }

    render() {
        return (
            <ul className="typelist-ul">
                {
                    this.props.types.map((item, idx) => {
                        return (
                            <li key={idx}
                                className={`typelist-li ${this.props.checked[item.type] ? 'checked' : null}`}
                                style={{color: colors[item.type]}}
                                onClick={this.changeChecked.bind(this, item.type)}
                                >
                                <div>
                                    {item.type} {item.value}
                                </div>
                            </li>
                        )
                    })
                }
            </ul>
        );
    }
}
