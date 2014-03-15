'use strict';

var path = require('path');

var configPath = process.env.NODE_CONFIG_DIR || path.join(process.cwd(), 'config');
var configEnvPath = path.join(configPath, 'environments');
var configRolePath = path.join(configPath, 'roles');

// verify the environment name exists in the environment path
function isValidEnv(environmentName){
  return environmentName ? isValidConfig(configEnvPath, environmentName) : (void 0);
}  

// verify the role name exists in the role path
function isValidRole(roleName){
  return roleName ? isValidConfig(configRolePath, roleName) : (void 0);
}

// If the config exists, then it's valid....
function isValidConfig(configPath, element){
  try{
    return (typeof require(path.join(configPath, element)) === "function") ? element : (void 0);
  }
  catch(e){
    return (void 0);
  }
}

var getConfigAt = function(loadPath, environmentName, roleName){
  configPath = loadPath;
  configEnvPath = path.join(configPath, 'environments');
  configRolePath = path.join(configPath, 'roles');
  
  return getConfigFor(environmentName, roleName);
};

var getConfigFor = function(environmentName, roleName){
  
  // passed in name > environment > default == 'developement'
  environmentName = isValidEnv(environmentName || process.env.NODE_ENV || 'development');
  roleName = isValidRole(roleName || process.env.ROLE_NAME);

  // load default config values (default needs to exist)
  var env = require(path.join(configPath, 'default'))(environmentName, roleName);

  // apply environment specific values if any
  if (environmentName){
    try{
      require(path.join(configEnvPath, environmentName))(env);
    }
    catch(e){
      // oh well, we tried...
    }      
  }

  // apply role specfic values if any
  if (roleName){
    try{
      require(path.join(configRolePath, roleName))(env);
    }
    catch(e){
      // oh well, we tried...
    }
  }

  // apply local only config (if any)
  try{
    require(path.join(configPath, 'local.js'))(env);
  }
  catch(e){
    // oh well, we tried...
  }
  
  env.getConfigFor = getConfigFor;
  env.getConfigAt = getConfigAt;
  
  return env;
};

module.exports.getConfigFor = getConfigFor;
module.exports.getConfigAt = getConfigAt;

module.exports = getConfigFor();
