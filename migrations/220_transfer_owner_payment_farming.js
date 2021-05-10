const PaymentFarmingProxy = artifacts.require("PaymentFarmingProxy");
const data = require('./conf');

module.exports = function (deployer, network, accounts) {
    let config = data[deployer.network_id];
    let _owner = config.owner;
    return PaymentFarmingProxy.deployed().then(proxy => {
        proxy.transferOwnership(_owner);
    });

};
