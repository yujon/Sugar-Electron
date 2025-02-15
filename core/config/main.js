const path = require('path');
const fs = require('fs');
const os = require('os');
const DEFAULT_PATH = path.join(process.cwd(), 'config');
const APP_DATA = path.join(os.homedir(), '/AppData/Roaming');
const { CONFIG_PATH, CONFIG_GET } = require('../const');
global[CONFIG_PATH] = DEFAULT_PATH;
let config = null;
let appName = '';

// 获取环境变量参数
function getProcessArgv() {
    const argv = {};
    process.argv.forEach(function (item, i) {
        if (i > 0) {
            const res = item.split('=');
            if (res.length === 2) {
                argv[res[0]] = res[1];
            }
        }
    });
    return argv;
}
// 从appData获取配置
function getConfigFromAppData(appName) {
    const configPath = path.join(APP_DATA, appName, 'config.json');
    let config = {};
    try {
        // 从appData读取环境变量
        const res = fs.readFileSync(configPath);
        config = JSON.parse(res.toString());
    } catch (error) {
        console.error('获取appData配置失败，不影响使用');
    }
    return Object.assign({ env: '', config: {} }, config);
}
// 获取项目本地config基础配置
function getLocalBaseConfig(configPath) {
    try {
        return require(path.join(configPath, 'config.base')) || {}
    } catch (error) {
        console.error(error);
        return {};
    }
}
// 获取项目本地config配置
function getLocalConfig(configPath, env) {
    const configName = `config.${env}`.replace(/\.$/, '');
    try {
        return require(path.join(configPath, configName)) || {};
    } catch (error) {
        console.error(error);
        return {};
    }
}

const getConfig = global[CONFIG_GET] = function () {
    if (config === null) {
        const appData = getConfigFromAppData(appName);
        const argv = getProcessArgv();
        const env = appData.env || argv.env || '';
        const baseLocalConfig = getLocalBaseConfig(global[CONFIG_PATH]);
        const localConfig = getLocalConfig(global[CONFIG_PATH], env);
        config = Object.assign({ argv }, baseLocalConfig, localConfig, appData.config);
    }
    return config;
}

module.exports = {
    getConfig,
    /**
     * 设置参数
     * @param {object} params
     * option.appName 应用名
     * option.configPath 默认配置目录路径，如果不传则自动加载根目录config目录 
     * */
    setOption(params = {}) {
        appName = params.appName || '';
        global[CONFIG_PATH] = params.configPath;
        return getConfig();
    }
};

