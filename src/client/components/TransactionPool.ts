import React, {Component} from 'react';
import Transaction from './Transaction';
import { Button } from 'react-bootstrap';
import {Link} from 'react-router-dom';
import history from './history';

const POLL_INTERVAL_MS = 10000;

class TransactionPool extends Component<{},{}>{
    state = {
        transactionPoolMap: {}
    };

    private fetchPoolMapInterval: any;

    fetchTransactionPoolMap = () => {
        fetch('http://localhost:3000/api/transaction-pool-map')
        .then(response => response.json())
        .then(json => this.setState({transactionPoolMap: json}));
    }

    fetchMineTransactions = () => {
        fetch('http://localhost:3000/api/mine-transaction')
        .then(response => {
            if(response.status === 200){
                alert('success');
                history.push('/blocks');
            } else {
                alert('The mine-transactions block request did not complete');
            }
        })
        .then()
    }

    componentDidMount(){
        this.fetchTransactionPoolMap();

        this.fetchPoolMapInterval = setInterval(
            () => this.fetchTransactionPoolMap(),
            POLL_INTERVAL_MS
        );
    }

    componentWillUnmount() {
        clearInterval(this.fetchPoolMapInterval);
    }

    render(){
        return (
            <div className="TransactionPool">
                <div><Link to="/">Home</Link></div>
                <h3>Transaction Pool</h3>
                {
                    Object.values(this.state.transactionPoolMap).map(transaction => {
                        return(
                            <div key={transaction.id}>
                                <Transaction transaction={transaction}/>
                            </div>
                        );
                    })
                }
                <Button
                    bsStyle="danger"
                    onClick={this.fetchMineTransactions}
                >
                    Mine the transactions
                </Button>
            </div>
        )
    }
}

export default TransactionPool;