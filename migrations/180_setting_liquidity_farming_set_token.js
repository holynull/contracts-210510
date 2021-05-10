const LiquidityFarmingProxy = artifacts.require("LiquidityFarmingProxy");
const BSTToken = artifacts.require("BSTToken");

module.exports = function (deployer, network, accounts) {

    return BSTToken.deployed().then(bst => {
        return LiquidityFarmingProxy.deployed().then(proxy => {
            return proxy.setToken(bst.address);
        });
    });

};
