const AudioRegistry = artifacts.require("AudioRegistry");

module.exports = function (deployer) {
    deployer.deploy(AudioRegistry);
};
