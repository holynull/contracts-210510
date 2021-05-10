const LiquidityFarmingProxy = artifacts.require("LiquidityFarmingProxy");
const BSTMinter = artifacts.require("BSTMinter");

module.exports = function (deployer, network, accounts) {

    return BSTMinter.deployed().then(minter => {
        return LiquidityFarmingProxy.deployed().then(proxy => {
            return proxy.setMinter(minter.address);
        });
    });

};
