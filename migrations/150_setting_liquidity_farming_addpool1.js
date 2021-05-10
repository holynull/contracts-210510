const LiquidityFarmingProxy = artifacts.require("LiquidityFarmingProxy");
const BStablePool1 = artifacts.require("BStablePool1");
const data = require('./conf');

module.exports = function (deployer, network, accounts) {
    let config = data[deployer.network_id];
    return BStablePool1.deployed().then(pool1 => {
        let pool1Address;
        if (pool1) {
            pool1Address = pool1.address;
        } else {
            pool1Address = config.pool1;
        }
        return LiquidityFarmingProxy.deployed().then(proxy => {
            return proxy.add(5, pool1Address, false);
        });
    });


};
