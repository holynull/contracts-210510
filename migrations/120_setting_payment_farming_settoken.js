const PaymentFarmingProxy = artifacts.require("PaymentFarmingProxy");
const BSTToken = artifacts.require("BSTToken");

module.exports = function (deployer, network, accounts) {

    return BSTToken.deployed().then(bst => {
        return PaymentFarmingProxy.deployed().then(payment => {
            return payment.setToken(bst.address);
        });
    });

};
