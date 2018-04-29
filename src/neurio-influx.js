
global.neurioClientId = 'I5ZedET8RniJIoeZnEwZoQ';
global.neurioClientSecret = 'CjMlxEeIRAmxzTwZb6Xr3g';
global.influxServer = 'server1';
global.influxDB = 'home';
global.Influx = require('influx');
global.nAuth = require('neurio').Auth

//Setup logger
const winston = require('winston')
global.logger = winston.createLogger({
   level: 'info',
	 transports: [new winston.transports.Console()],
	 format: winston.format.combine(
    	winston.format.colorize({ all: true }),
    	winston.format.simple()
  	)
});
var logger = global.logger;



function NIManager() {
  this.influx = new Influx.InfluxDB({
    host: influxServer,
    database: influxDB
  });
  this.neurio = nAuth;
}

NIManager.prototype.writeSample = function() {
    return nim.neurio.simple(neurioClientId, neurioClientSecret).then(function (client) {
        client.defaultSensorId().then(function (sensorId) {
          client.lastSample(sensorId).then(function (samples) {
            nim.influx.writePoints([
              {
                measurement: 'power',
                tags: { deviceName:'house' },
                fields: {  value: samples.consumptionPower },
              },
              {
                measurement: 'power',
                tags: { deviceName:'tesla' },
                fields: {  value: samples.submeters[2].power},
              }
            ])
            logger.info("Wrote samples to DB -- " + samples.consumptionPower)
          })
        })
      })
}

NIManager.prototype.processIt = async function() {
    var self = this;
    self.writeSample();
    // Now repeat every X minutes....
    setInterval(self.writeSample,1*60*1000)
  }

let startup = function() {
	if (process.env.NODE_ENV !== 'production') {
		global.logger.level = 'debug';
	}

  global.nim = new NIManager();
  nim.processIt();

};

startup();
