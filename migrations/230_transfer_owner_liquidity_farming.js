const LiquidityFarmingProxy = artifacts.require("LiquidityFarmingProxy");
const data = require('./conf');

module.exports = function (deployer, network, accounts) {
    let config = data[deployer.network_id];
    let _owner = config.owner;
    return LiquidityFarmingProxy.deployed().then(proxy => {
        proxy.transferOwnership(_owner);
    });

};
