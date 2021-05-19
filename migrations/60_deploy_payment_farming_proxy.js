const PaymentFarmingProxy = artifacts.require("PaymentFarmingProxy");
const HuaHuaToken = artifacts.require("HuaHuaToken");
const data = require('./conf');

module.exports = function (deployer, network, accounts) {
    let config = data[deployer.network_id];
    let name = config.payment.name;
    let symbol = config.payment.symbol;
    let perf = (dev) => {
        return deployer.deploy(PaymentFarmingProxy, name, symbol, accounts[0], dev).then(res => {
            console.log('constructor[0]:' + name);
            console.log('constructor[1]:' + symbol);
            console.log('constructor[2]:' + accounts[0]);
            console.log('constructor[3]:' + dev);
        });
    };
    if (config.huahua) {
        return HuaHuaToken.at(config.huahua).then(huahua => {
            return huahua.holders(0).then(dev => {
                return perf(dev);
            });
        }).catch(e=>{
            console.error(e);
        });
    } else {
        return perf(config.dev).catch(e=>{
            console.error(e);
        });
    }

};
