const PaymentFarmingProxy = artifacts.require("PaymentFarmingProxy");
const TokenUSDC = artifacts.require("TokenUSDC");
const data = require('./conf');

module.exports = function (deployer, network, accounts) {
    let config = data[deployer.network_id];
    TokenUSDC.deployed().then(usdc => {
        let usdcAddress;
        if (usdc) {
            usdcAddress = usdc.address;
        } else {
            usdcAddress = config.usdc;
        }
        return PaymentFarmingProxy.deployed().then(payment => {
            return payment.addCoins(usdcAddress, 0);
        });
    });
};
