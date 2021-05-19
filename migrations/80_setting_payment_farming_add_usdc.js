const PaymentFarmingProxy = artifacts.require("PaymentFarmingProxy");
const TokenUSDC = artifacts.require("TokenUSDC");
const data = require('./conf');

module.exports = function (deployer, network, accounts) {
    let config = data[deployer.network_id];
    return TokenUSDC.deployed().then(usdc => {
        return PaymentFarmingProxy.deployed().then(payment => {
            return payment.addCoins(usdc.address, 0);
        });
    }).catch(e => {
        return PaymentFarmingProxy.deployed().then(payment => {
            return payment.addCoins(config.usdc, 0);
        });
    });
};
