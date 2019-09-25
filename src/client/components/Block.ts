import React, {Component} from 'react';
import {Button} from 'react-bootstrap';
import { bsStyles } from 'react-bootstrap/lib/utils/bootstrapUtils';

class Block extends Component<{},{}>{

    state = {
        displayTransaction: false
    };

    toggleTransaction = () =>{
        this.setState({
            displayTransaction: !this.state.displayTransaction
        });
    }

    get displayTransaction(){
        const {data} = this.props.block;
        const stringifiedData = JSON.stringify(data);
        const dataDisplay = stringifiedData.length > 15 ?
            `${stringifiedData.substring(0,15)}...` :
            stringifiedData;
        
        const display = this.state.displayTransaction ?
            <div>
                {
                    data.map(transaction => (
                        <div key={transaction.id}>
                            <Transaction transaction={transaction}/>
                        </div>
                    ))
                }
                <Button bsStyle="danger" bsSize="small" onClick={this.toggleTransaction}>Show Less</Button>
            </div>
        :
        <div>
            <div>Data: {dataDisplay}</div>
            <Button bsStyle="danger" bsSize="small" onClick={this.toggleTransaction}>Show More</Button>
        </div>;

        return {display};
    }

    render(){
        const {timestamp, hash, data} = this.props.block;
        
        const hashDisplay = `${hash.substring(0,15)}...`;
        
        
        return(
            <div className="Block">
                <div>Hash: {hashDisplay}</div>
                <div>Timestamp: {new Date(timestamp).toLocaleString()}</div>
                <div>Data: {dataDisplay}</div>
                {this.displayTransaction}
            </div>
        );
    }
}

export default Block;