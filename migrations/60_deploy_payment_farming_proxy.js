const PaymentFarmingProxy = artifacts.require("PaymentFarmingProxy");
const data = require('./conf');

module.exports = function (deployer, network, accounts) {
    let config = data[deployer.network_id];
    let name = config.payment.name;
    let symbol = config.payment.symbol;
    let dev = config.dev;
    return deployer.deploy(PaymentFarmingProxy, name, symbol, accounts[0], dev).then(res => {
        console.log('constructor[0]:' + name);
        console.log('constructor[1]:' + symbol);
        console.log('constructor[2]:' + accounts[0]);
    });

};
