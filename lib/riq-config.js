'use strict';

var path = require('path');

// If the config exists, then it's valid...
function isValidConfig(configPath, element){
  try{
    return (typeof require(path.join(configPath, element)) === "function") ? element : (void 0);
  }
  catch(e){
    return (void 0);
  }
}

function applyConfigToEnv(configPath, configName, env){
  if (configName){
    try{
      require(path.join(configPath, configName))(env);
    }
    catch(e){
      // oh well, we tried...
    }      
  }  
}

var getConfigFor = function(environmentName, roleName, configPath){

  configPath = configPath || process.env.NODE_CONFIG_DIR || path.join(process.cwd(), 'config');

  var configEnvPath = path.join(configPath, 'environments');
  var configRolePath = path.join(configPath, 'roles');

  // passed in name > environment > default == 'developement'
  environmentName = isValidConfig(configEnvPath, (environmentName || process.env.NODE_ENV || 'development'));
  roleName = isValidConfig(configRolePath, (roleName || process.env.ROLE_NAME));

  // load default config values (default needs to exist)
  var env = require(path.join(configPath, 'default'))(environmentName, roleName);

  // apply environment specific values if any
  applyConfigToEnv(configEnvPath, environmentName, env);

  // apply role specfic values if any
  applyConfigToEnv(configRolePath, roleName, env);

  // apply local only config (if any)
  applyConfigToEnv(configPath, 'local.js', env);
  
  env.getConfigFor = getConfigFor;  
  return env;
};

module.exports.getConfigFor = getConfigFor;

module.exports = getConfigFor();
