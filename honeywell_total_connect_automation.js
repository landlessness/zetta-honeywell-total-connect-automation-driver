var Device = require('zetta-device');
var util = require('util');

var TIMEOUT = 2000;

var HoneywellTotalConnectAutomation = module.exports = function() {
  Device.call(this);

  this._soap = arguments[0];
  this.locationID = arguments[1].LocationID;

  var device = arguments[2];
  this.deviceID = device.DeviceID;
  this.deviceName = device.DeviceName;
  this.deviceSerialNumber = device.DeviceSerialNumber;

  var flags = device.DeviceFlags.split(',');
  for (i=0; i<flags.length; i++) {
    var flagKeyValue = flags[i].split('=');
    var key = flagKeyValue[0].charAt(0).toLowerCase() + flagKeyValue[0].slice(1);
    this[key] = flagKeyValue[1];
  }

  this.automationData = arguments[3];
  console.log('AutomationData Driver constructor automationData: ' + util.inspect(this.automationData));
  this.accountID = this.automationData.AccountID;
  this.deviceSerialText = this.automationData.DeviceSerialText;
  this.lockCapacity = this.automationData.LockCapacity;
  this.switchCapacity = this.automationData.SwitchCapacity;
  this.thermostatCapacity = this.automationData.ThermostatCapacity;
  this.sceneCapacity = this.automationData.SceneCapacity;
  this.deviceCapacityPerScene = this.automationData.DeviceCapacityPerScene;
  this.syncDeviceFlag = this.automationData.SyncDeviceFlag;
  this.communicationState = this.automationData.CommunicationState;
  this.automationStatusLimit = this.automationData.AutomationStatusLimit;
};
util.inherits(HoneywellTotalConnectAutomation, Device);

// TODO: check the actual status of the panel then set current state
HoneywellTotalConnectAutomation.prototype.init = function(config) {

  config
    .name(this.deviceName)
    .type('automation')
    .state('ready')
    .monitor('automationData')
    .map('update-state', this.updateState, [{name: 'newState', type: 'text'}]);
    
    this._getAutomationDeviceStatusEx();
};


HoneywellTotalConnectAutomation.prototype._getAutomationDeviceStatusEx = function() {
  console.log('_getAutomationDeviceStatusEx ');
  this._soap._getAutomationDeviceStatusEx(this.deviceID, this._getAutomationDeviceStatusExCallback.bind(this));
}

HoneywellTotalConnectAutomation.prototype._getAutomationDeviceStatusExCallback = function(err, result, raw, soapHeader) {
  
  if (err) {
    console.log('err _getAutomationDeviceStatusExCallback');
    return;
  }
  
  switch (result.GetAutomationDeviceStatusExResult.ResultCode) {
  case 0:
    this.automationData = result.GetAutomationDeviceStatusExResult.AutomationData;
    console.log('AutomationData callback: ' + util.inspect(this.automationData.AutomationSwitch));

    setTimeout(this._getAutomationDeviceStatusEx.bind(this), TIMEOUT);
    
    break;
  default:
    console.log('default: _getAutomationDeviceStatusExCallback: ' + util.inspect(result));
    break;
  }
}

HoneywellTotalConnectAutomation.prototype.updateState = function(newState, cb) {
  this.state = newState;
  cb();
}