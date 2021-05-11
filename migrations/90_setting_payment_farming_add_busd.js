const PaymentFarmingProxy = artifacts.require("PaymentFarmingProxy");
const TokenBUSD = artifacts.require("TokenBUSD");
const data = require('./conf');

module.exports = function (deployer, network, accounts) {
    let config = data[deployer.network_id];
    TokenBUSD.deployed().then(busd => {
        return PaymentFarmingProxy.deployed().then(payment => {
            return payment.addCoins(busd.address, 1);
        });
    }).catch(e => {
        return PaymentFarmingProxy.deployed().then(payment => {
            return payment.addCoins(config.busd, 1);
        });
    });
};
