const LiquidityFarmingProxy = artifacts.require("LiquidityFarmingProxy");
const BStablePool2 = artifacts.require("BStablePool2");
const data = require('./conf');

module.exports = function (deployer, network, accounts) {
    let config = data[deployer.network_id];
    return BStablePool2.deployed().then(pool2 => {
        let pool2Address;
        if (pool2) {
            pool2Address = pool2.address;
        } else {
            pool2Address = config.pool2;
        }
        return LiquidityFarmingProxy.deployed().then(proxy => {
            return proxy.add(5, pool2Address, false);
        });
    });


};
