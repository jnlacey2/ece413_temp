var express = require('express');
var router = express.Router();
var fs = require('fs');
var Device = require("../models/device");
var DeviceReport = require("../models/deviceReport");
var jwt = require("jwt-simple");

/* Authenticate user */
var secret = fs.readFileSync(__dirname + '/../../jwtkey').toString();

// Function to generate a random apikey consisting of 32 characters
function getNewApikey() {
    var newApikey = "";
    var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    
    for (var i = 0; i < 32; i++) {
       newApikey += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
    }

    return newApikey;
}


//Device Report
router.post('/report', (req, res, next) => {
	var reportedDevice = Device.findOne({"deviceId": req.body.deviceID})
		.exec()
		.then(docs => {
		if(!docs) {
			console.log("Device not found");
			res.status(401).json({success: false, message: "Device not registered"})

		}
		else {
			console.log(docs.deviceId);
		console.log("That was an ID");
		const newDeviceReport = new DeviceReport({
		deviceID: req.body.deviceID,
    			GPS_lat:  req.body.GPS_lat,
    			GPS_lon:  req.body.GPS_lon,
    			GPS_speed: req.body.GPS_speed,
    			uvLevel: req.body.uvLevel,
    			session: req.body.session
    		    });
		console.log(newDeviceReport.deviceID);
		console.log(newDeviceReport.GPS_lat);
		console.log(newDeviceReport.GPS_lon);
		console.log(newDeviceReport.GPS_speed);
		console.log(newDeviceReport.uvLevel);
		console.log(newDeviceReport.session);
		console.log(newDeviceReport.time);
		newDeviceReport.save(function(err, deviceReport) {
			console.log(err);
			console.log("Hmm");
			if(err != null) {
				console.log("hi");
				console.log(err.errmsg);
			}
			else {
		
			}
			res.status(201).json({success: true, message: "Don't trust this lol"})
		});
	}
	//res.status(200).json(docs);		
	});
	
});

router.get("/getall", (req, res, next) => {
	//const naame = req.params.name;
	DeviceReport.find()
		.exec()
		.then(docs => {
		console.log("From database: ", docs);
		res.status(200).json(docs);		
	});
});

router.get("/getalldevices", (req, res, next) => {
	Device.find()
		.exec()
		.then(docs => {
		console.log("From database: ", docs);
		res.status(200).json(docs);		
	});
});


// GET request return one or "all" devices registered and last time of contact.
router.get('/status/:devid', function(req, res, next) {
    var deviceId = req.params.devid;
    var responseJson = { devices: [] };

    if (deviceId == "all") {
      var query = {};
    }
    else {
      var query = {
          "deviceId" : deviceId
      };
    }
    
    Device.find(query, function(err, allDevices) {
      if (err) {
        var errorMsg = {"message" : err};
        res.status(400).json(errorMsg);
      }
      else {
         for(var doc of allDevices) {
            responseJson.devices.push({ "deviceId": doc.deviceId,  "lastContact" : doc.lastContact});
         }
      }
      res.status(200).json(responseJson);
    });
});

router.post('/register', function(req, res, next) {
    var responseJson = {
        registered: false,
        message : "",
        apikey : "none"
    };
    var deviceExists = false;
    
    // Ensure the request includes the deviceId parameter
    if( !req.body.hasOwnProperty("deviceId")) {
        responseJson.message = "Missing deviceId.";
        return res.status(400).json(responseJson);
    }

    var email = "";
    
    // If authToken provided, use email in authToken 
    if (req.headers["x-auth"]) {
        try {
            var decodedToken = jwt.decode(req.headers["x-auth"], secret);
            email = decodedToken.email;
        }
        catch (ex) {
            responseJson.message = "Invalid authorization token.";
            return res.status(400).json(responseJson);
        }
    }
    else {
        // Ensure the request includes the email parameter
        if( !req.body.hasOwnProperty("email")) {
            responseJson.message = "Invalid authorization token or missing email address.";
            return res.status(400).json(responseJson);
        }
        email = req.body.email;
    }
    
    // See if device is already registered
    Device.findOne({ deviceId: req.body.deviceId }, function(err, device) {
        if (device !== null) {
            responseJson.message = "Device ID " + req.body.deviceId + " already registered.";
            return res.status(400).json(responseJson);
        }
        else {
            // Get a new apikey
	         deviceApikey = getNewApikey();
	         
	         // Create a new device with specified id, user email, and randomly generated apikey.
            var newDevice = new Device({
                deviceId: req.body.deviceId,
                userEmail: email,
                apikey: deviceApikey
            });

            // Save device. If successful, return success. If not, return error message.
            newDevice.save(function(err, newDevice) {
                if (err) {
                    console.log("Error: " + err);
                    responseJson.message = err;
                    // This following is equivalent to:
                    //     res.status(400).send(JSON.stringify(responseJson));
                    return res.status(400).json(responseJson);
                }
                else {
                    responseJson.registered = true;
                    responseJson.apikey = deviceApikey;
                    responseJson.message = "Device ID " + req.body.deviceId + " was registered.";
                    return res.status(201).json(responseJson);
                }
            });
        }
    });
});

router.get('/getdata', function(req, res, next) {
	var htmlString = "";
	var returnData = {};
	returnData["deviceReports"] = [];
	var theDeviceIDs = req.query.theID;
	console.log("gettingData");
	//one registered device ID should be passed over at a time. Start a new table row here?
	for (var aDeviceID of theDeviceIDs) {
		console.log(aDeviceID);
	
	   	DeviceReport.find({deviceID: aDeviceID})
         	.exec()
		.then(docs => {
 				for(var doc of docs) {
					var singleReport = {
						 "deviceID": doc.deviceID,
    						 "GPS_lat": doc.GPS_lat,
   						 "GPS_lon": doc.GPS_lon,
						 "GPS_speed": doc.GPS_speed,
   						 "uvLevel": doc.uvLevel,
  						 "session": doc.session
					};
					
					returnData["deviceReports"].push(singleReport);
				
					
					console.log(singleReport);
					console.log(doc.uvLevel);
				}
					
				console.log("hello world");
				console.log(JSON.stringify(returnData));
				return res.status(200).json(JSON.stringify(returnData));
		
		});
	
	}
	
	
});


module.exports = router;
