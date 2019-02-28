const Block = require('./block');
const cryptoHash = require('./crypto-hash');

class Blockchain {
    constructor() {
        this.chain = [Block.genesis()];
    }

    addBlock({data}) {
        const newBlock = Block.mineBlock({
            lastBlock: this.chain[this.chain.length-1],
            data
        });

        this.chain.push(newBlock);
    }

    replaceChain(chain) {
        if(chain.length > this.chain.length && Blockchain.isValidChain(chain)) {
            this.chain = chain;
        }
    }

    static isValidChain(chain) {
        let isValid = JSON.stringify(chain[0]) === JSON.stringify(Block.genesis());

        if(isValid){
            for(let i = 1; i < chain.length && isValid; i++){
                const block = chain[i] ;
                const actualLastHash = chain[i-1].hash;
                const lastDifficulty = chain[i-1].difficulty;
                const { timestamp, lastHash, hash, nonce, difficulty, data } = block;
                const validatedHash = cryptoHash(timestamp,lastHash, data, nonce, difficulty);
    
                // if(lastHash !== actualLastHash)
                //     return false;
    
    
                //     if(hash !== validatedHash) return false;

                isValid = isValid && (
                    lastHash === actualLastHash && 
                    hash === validatedHash && 
                    (Math.abs(lastDifficulty - difficulty) <= 1)
                );
            }
        }

        return isValid;
    }
}

module.exports = Blockchain;
