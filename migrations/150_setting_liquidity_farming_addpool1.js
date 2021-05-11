const LiquidityFarmingProxy = artifacts.require("LiquidityFarmingProxy");
const BStablePool1 = artifacts.require("BStablePool1");
const data = require('./conf');

module.exports = function (deployer, network, accounts) {
    let config = data[deployer.network_id];
    return BStablePool1.deployed().then(pool1 => {
        return LiquidityFarmingProxy.deployed().then(proxy => {
            return proxy.add(5, pool1.address, false);
        });
    }).catch(e => {
        return LiquidityFarmingProxy.deployed().then(proxy => {
            return proxy.add(5, config.pool1, false);
        });
    });


};
