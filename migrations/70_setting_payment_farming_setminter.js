const PaymentFarmingProxy = artifacts.require("PaymentFarmingProxy");
const BSTMinter = artifacts.require("BSTMinter");

module.exports = function (deployer, network, accounts) {

    return BSTMinter.deployed().then(minter => {
        return PaymentFarmingProxy.deployed().then(payment => {
            return payment.setMinter(minter.address);
        });
    });

};
