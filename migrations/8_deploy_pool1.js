const BStablePool1 = artifacts.require("BStablePool1");
const TokenDAI = artifacts.require("TokenDAI");
const TokenBUSD = artifacts.require("TokenBUSD");
const TokenUSDT = artifacts.require("TokenUSDT");

module.exports = function (deployer, network, accounts) {
    let pArr = new Array();
    pArr.push(TokenDAI.deployed());
    pArr.push(TokenBUSD.deployed());
    pArr.push(TokenUSDT.deployed());
    return Promise.all(pArr).then(tokens => {
        let daiAddress = tokens[0].address;
        let busdAddress = tokens[1].address;
        let usdtAddress = tokens[2].address;
        let stableCoins = [daiAddress, busdAddress, usdtAddress];
        let A = 100;
        let fee = "30000000"; // 0.003
        let adminFee = "6666666667"; // 2/3
        let name = "BStable Pool (DAI / BUSD / USDT)";
        let symbol = "BSLP-01";
        return deployer.deploy(BStablePool1, name, symbol, stableCoins, A, fee, adminFee, accounts[0]).then(res => {
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
