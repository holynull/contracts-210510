const BSTMinter = artifacts.require("BSTMinter");
const PaymentFarmingProxy = artifacts.require("PaymentFarmingProxy");

module.exports = function (deployer, network, accounts) {

    return BSTMinter.deployed().then(minter => {
        return PaymentFarmingProxy.deployed().then(proxy => {
            return minter.add(50, proxy.address, false);
        });
    });

};
