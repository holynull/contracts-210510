const BStablePool = artifacts.require("BStablePool");
const TokenUSDC = artifacts.require("TokenUSDC");
const TokenBUSD = artifacts.require("TokenBUSD");
const TokenUSDT = artifacts.require("TokenUSDT");
const data = require('./conf');

module.exports = function (deployer, network, accounts) {
    let config = data[deployer.network_id];
    let pArr = new Array();
    pArr.push(TokenUSDC.deployed());
    pArr.push(TokenBUSD.deployed());
    pArr.push(TokenUSDT.deployed());

    return Promise.all(pArr).then(tokens => {
        let usdcAddress;
        let busdAddress;
        let usdtAddress;
        if (tokens.length === 3 && tokens[0] && tokens[1] && tokens[2]) {
            usdcAddress = tokens[0].address;
            busdAddress = tokens[1].address;
            usdtAddress = tokens[2].address;
        } else {
            usdcAddress = config.usdc;
            busdAddress = config.busd;
            usdtAddress = config.usdt;
        }
        let stableCoins = [usdcAddress, busdAddress, usdtAddress];
        let A = config.pool3.A;
        let fee = config.pool3.fee; // 0.003
        let adminFee = config.pool3.adminFee; // 2/3
        let name = config.pool3.name;
        let symbol = config.pool3.symbol;
        return deployer.deploy(BStablePool, name, symbol, stableCoins, A, fee, adminFee, accounts[0]).then(res => {
            console.log('constructor[0]:' + name);
            console.log('constructor[1]:' + symbol);
            console.log('constructor[2]:' + JSON.stringify(stableCoins));
            console.log('constructor[3]:' + A);
            console.log('constructor[4]:' + fee);
            console.log('constructor[5]:' + adminFee);
            console.log('constructor[6]:' + accounts[0]);
        });
    });


};
