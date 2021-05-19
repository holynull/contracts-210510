const HuaHuaToken = artifacts.require("HuaHuaToken");
const data = require('./conf');

module.exports = function (deployer, network, accounts) {
    return deployer.deploy(HuaHuaToken).catch(e=>{
        console.error(e);
    });
};
