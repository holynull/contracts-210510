const TokenDAI = artifacts.require("TokenDAI");
const TokenBUSD = artifacts.require("TokenBUSD");
const TokenUSDT = artifacts.require("TokenUSDT");
const TokenUSDC = artifacts.require("TokenUSDC");
const TokenQUSD = artifacts.require("TokenQUSD");
const data = require('./conf');

module.exports = function (deployer, network, accounts) {
    let pArr = new Array();
    pArr.push(deployer.deploy(TokenDAI));
    pArr.push(deployer.deploy(TokenBUSD));
    pArr.push(deployer.deploy(TokenUSDT));
    pArr.push(deployer.deploy(TokenUSDC));
    pArr.push(deployer.deploy(TokenQUSD));
    return Promise.all(pArr).catch(e=>{
        console.error(e);
    });
};
