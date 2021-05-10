const LiquidityFarmingProxy = artifacts.require("LiquidityFarmingProxy");
const BStablePool = artifacts.require("BStablePool");

module.exports = function (deployer, network, accounts) {

    return BStablePool.deployed().then(pool3 => {
        return LiquidityFarmingProxy.deployed().then(proxy => {
            return proxy.add(90, pool3.address, false);
        });
    });

};
