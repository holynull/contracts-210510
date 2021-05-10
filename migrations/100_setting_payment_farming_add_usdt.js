const PaymentFarmingProxy = artifacts.require("PaymentFarmingProxy");
const TokenUSDT = artifacts.require("TokenUSDT");
const data = require('./conf');

module.exports = function (deployer, network, accounts) {
    let config = data[deployer.network_id];
    TokenUSDT.deployed().then(usdt => {
        let usdtAddress;
        if (usdt) {
            usdtAddress = usdt.address;
        } else {
            usdtAddress = config.usdt;
        }
        return PaymentFarmingProxy.deployed().then(payment => {
            return payment.addCoins(usdtAddress, 2);
        });
    });
};
