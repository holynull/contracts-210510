const PaymentFarmingProxy = artifacts.require("PaymentFarmingProxy");
const BStablePool = artifacts.require("BStablePool");

module.exports = function (deployer, network, accounts) {

    return BStablePool.deployed().then(pool => {
        return PaymentFarmingProxy.deployed().then(payment => {
            return payment.setPool(pool.address);
        });
    });

};
