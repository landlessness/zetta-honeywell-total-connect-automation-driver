var Scout = require('zetta-scout');
var util = require('util');
var HoneywellTotalConnectAutomation = require('./honeywell_total_connect_automation');
var AUTOMATION_DEVICE_CLASS_ID = 3;

var HoneywellTotalConnectAutomationScout = module.exports = function() {
  Scout.call(this);
};
util.inherits(HoneywellTotalConnectAutomationScout, Scout);

HoneywellTotalConnectAutomationScout.prototype.init = function(next) {
  var automationQuery = this.server.where({ type: 'automation' });
  var soapQuery = this.server.where({ type: 'soap' });

  var self = this;
  
  this.server.observe(soapQuery, function(honeywellSoap) {
    for (i=0; i < honeywellSoap.deviceLocations.length; i++) {
      console.log('device list: ' + util.inspect(honeywellSoap.deviceLocations[i].DeviceList.DeviceInfoBasic));
      var deviceLocation = honeywellSoap.deviceLocations[i];
      automationDevices = deviceLocation.DeviceList.DeviceInfoBasic.filter(function(device) {
        return device.DeviceClassID === AUTOMATION_DEVICE_CLASS_ID;
      });
      for (j=0; j < automationDevices.length; j++) {
        var automationDevice = automationDevices[i];
        // TODO: grab and pass to the driver: GetAutomationDeviceStatusEx
        honeywellSoap._getAutomationDeviceStatusEx(automationDevice.DeviceID, function(err, result, raw, soapHeader){
          console.log('_getAutomationDeviceStatusEx result: ' + util.inspect(result));
          var automationData = result.GetAutomationDeviceStatusExResult.AutomationData;
          console.log('AutomationData Scout automationData: ' + util.inspect(automationData));
          (function(deviceLocation, automationDevice, automationData){
            console.log('deviceLocation.LocationID: ' +  deviceLocation.LocationID);
            console.log('automationDevice.DeviceID: ' + automationDevice.DeviceID);
            var query = self.server.where({type: 'automation', locationID: deviceLocation.LocationID, deviceID: automationDevice.DeviceID});
            self.server.find(query, function(err, results) {
              if (results[0]) {
                self.provision(results[0], HoneywellTotalConnectAutomation, honeywellSoap, deviceLocation, automationDevice, automationData);
              } else {
                self.discover(HoneywellTotalConnectAutomation, honeywellSoap, deviceLocation, automationDevice, automationData);
              }
            });
          })(deviceLocation, automationDevice, automationData);
        });
      }
    }
    next();
  });
}