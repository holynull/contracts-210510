const LiquidityFarmingProxy = artifacts.require("LiquidityFarmingProxy");
const data = require('./conf');

module.exports = function (deployer, network, accounts) {
    let config = data[deployer.network_id];
    return deployer.deploy(LiquidityFarmingProxy, accounts[0]).then(res => {
        console.log('constructor[0]:' + accounts[0]);
    });

};
