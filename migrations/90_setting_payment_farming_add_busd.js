const PaymentFarmingProxy = artifacts.require("PaymentFarmingProxy");
const TokenBUSD = artifacts.require("TokenBUSD");
const data = require('./conf');

module.exports = function (deployer, network, accounts) {
    let config = data[deployer.network_id];
    TokenBUSD.deployed().then(busd => {
        let busdAddress;
        if (busd) {
            busdAddress = busd.address;
        } else {
            busdAddress = config.busd;
        }
        return PaymentFarmingProxy.deployed().then(payment => {
            return payment.addCoins(busdAddress, 1);
        });
    });
};
