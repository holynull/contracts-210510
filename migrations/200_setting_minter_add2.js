const BSTMinter = artifacts.require("BSTMinter");
const LiquidityFarmingProxy = artifacts.require("LiquidityFarmingProxy");

module.exports = function (deployer, network, accounts) {

    return BSTMinter.deployed().then(minter => {
        return LiquidityFarmingProxy.deployed().then(proxy => {
            return minter.add(50, proxy.address, false);
        });
    });

};
