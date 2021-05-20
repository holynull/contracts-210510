const ethers = require('ethers');
const { projectId, mnemonic } = require('./secret.js');
const HuaHuaTokenJson = require('./build/contracts/HuaHuaToken.json');

const provider = new ethers.providers.JsonRpcProvider("https://data-seed-prebsc-2-s2.binance.org:8545/");
// 初始化助记词
const walletMnemonic = ethers.Wallet.fromMnemonic(mnemonic);
// 初始化钱包
const wallet = walletMnemonic.connect(provider);
const huahua = '0x25B101DDcf1Fd055a5D7548d0AdE1eAfA128cCd0';
const HuaHuaTokenContract = new ethers.Contract(huahua, HuaHuaTokenJson.abi, wallet);
let index = process.argv[2];
HuaHuaTokenContract.holders(index).then(holder => {
    wallet.sendTransaction({ to: holder, value: ethers.utils.parseEther("0.01") }).then(res => {
        console.log(JSON.stringify(res));
    });
});


