const PaymentFarmingProxy = artifacts.require("PaymentFarmingProxy");
const TokenUSDT = artifacts.require("TokenUSDT");
const data = require('./conf');

module.exports = function (deployer, network, accounts) {
    let config = data[deployer.network_id];
    TokenUSDT.deployed().then(usdt => {
        return PaymentFarmingProxy.deployed().then(payment => {
            return payment.addCoins(usdt.address, 2);
        });
    }).catch(e => {
        return PaymentFarmingProxy.deployed().then(payment => {
            return payment.addCoins(config.usdt, 2);
        });
    });
};
