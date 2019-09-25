import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import logo from '../assets/logo.png';

class App extends Component<{},{}>{
    
    state = {
        walletInfo: {
            address: 'fooxv6',
            balance: 9999
        }
    }

    componentDidMount() {
        fetch('http://localhost:3000/api/wallet-info')
            .then(response => response.json())
            .then(json => this.setState({ walletInfo: json}));
    }


    render(){
        const {address, balance} = this.state.walletInfo;

        return(
            <div className="App">
                <img className="logo" src="{logo}"/>
                <div>
                    Welcome to blockchain
                </div>
                <div>
                    <Link to="/blocks">Blocks</Link>
                </div>
                <div>
                    <Link to="/conduct-transaction">Condict a transaction</Link>
                </div>
                <div>
                    <Link to="/transaction-pool">Transaction pool</Link>
                </div>
                <div className="WalletInfo">
                    <div>Address: {address}</div>
                    <div>Balance: {balance}</div>
                </div>
            </div>
        );
    }
}

export default App;