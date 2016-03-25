var HoneywellDevice = require('zetta-honeywell-total-connect-driver');
var util = require('util');

var TIMEOUT = 2000;

var HoneywellTotalConnectAutomation = module.exports = function() {
  HoneywellDevice.call(this, arguments[0], arguments[1], arguments[2].LocationID);

  this.AutomationData = arguments[3];
  console.log('AutomationData Driver constructor AutomationData: ' + util.inspect(this.AutomationData));
  this.AccountID = this.AutomationData.AccountID;
  this.DeviceSerialText = this.AutomationData.DeviceSerialText;
  this.LockCapacity = this.AutomationData.LockCapacity;
  this.SwitchCapacity = this.AutomationData.SwitchCapacity;
  this.ThermostatCapacity = this.AutomationData.ThermostatCapacity;
  this.SceneCapacity = this.AutomationData.SceneCapacity;
  this.DeviceCapacityPerScene = this.AutomationData.DeviceCapacityPerScene;
  this.SyncDeviceFlag = this.AutomationData.SyncDeviceFlag;
  this.CommunicationState = this.AutomationData.CommunicationState;
  this.AutomationStatusLimit = this.AutomationData.AutomationStatusLimit;
};
util.inherits(HoneywellTotalConnectAutomation, HoneywellDevice);

// TODO: check the actual status of the panel then set current state
HoneywellTotalConnectAutomation.prototype.init = function(config) {

  config
    .name(this.DeviceName)
    .type('automation')
    .state('ready')
    .monitor('AutomationData')
    .map('update-state', this.updateState, [{name: 'newState', type: 'text'}]);
    
    this._getAutomationDeviceStatusEx();
};


HoneywellTotalConnectAutomation.prototype._getAutomationDeviceStatusEx = function() {
  console.log('_getAutomationDeviceStatusEx ');
  this._soap._getAutomationDeviceStatusEx(this.DeviceID, this._getAutomationDeviceStatusExCallback.bind(this));
}

HoneywellTotalConnectAutomation.prototype._getAutomationDeviceStatusExCallback = function(err, result, raw, soapHeader) {
  
  if (err) {
    console.log('err _getAutomationDeviceStatusExCallback');
    return;
  }
  
  switch (result.GetAutomationDeviceStatusExResult.ResultCode) {
  case 0:
    this.AutomationData = result.GetAutomationDeviceStatusExResult.AutomationData;
    console.log('AutomationData callback: ' + util.inspect(this.AutomationData.AutomationSwitch));

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