function sendReqForAccountInfo() {
   $.ajax({
      url: '/users/account',
      type: 'GET',
      headers: { 'x-auth': window.localStorage.getItem("authToken") },
      responseType: 'json',
      success: accountInfoSuccess,
      error: accountInfoError
   });
}

function accountInfoSuccess(data, textStatus, jqXHR) {
   	var tableHTML = "";
	$("#userName").html(data.fullName); 

	console.log("account found");
	var allIDs = [];
	for (var device of data.devices) {
		var anId = device.deviceId;
		allIDs.push(anId);
		console.log(anId);
	} 
		$.ajax({
      			url: '/devices/getdata',
     	 		type: 'GET',
			data: {"theID": allIDs},
     	 		responseType: 'json',
     	 		success: reportedData,
     	 		error: accountInfoError
  	 	});
    
  	 

    	console.log("tried to add data");
	

}

function reportedData(data, textStatus, jqXHR) {
	
	var jsonInput = data;
	
	console.log("Hey");
	//debug
	//var jsonInput = '{"deviceReports": [{ "deviceID": "logTester", "GPS_lat": "70", "GPS_lon": "69", "GPS_speed": "420", "uvLevel": "101", "session": "200" },{ "deviceID": "logTester", "GPS_lat": "78", "GPS_lon": "65", "GPS_speed": "100", "uvLevel": "3", "session": "40" }]}';
	var tableDiv = document.getElementById("thetablezone");
	//$("#userName").html("Billy"); 
	//debug

	var reportsObject = JSON.parse(jsonInput);
	var tableObj = document.createElement("table");
	var headingRow = document.createElement("tr");
	var headLat = document.createElement("th");
	var headLon = document.createElement("th");
	var headSpeed = document.createElement("th");
	var headUv = document.createElement("th");
	var headSession = document.createElement("th");
	headLat.innerHTML = "Lattitude";
	headLon.innerHTML = "Longitude";
	headSpeed.innerHTML = "Speed";
	headUv.innerHTML = "UvLevel";
	headSession.innerHTML = "Session";
	headingRow.appendChild(headLat);
	headingRow.appendChild(headLon);
	headingRow.appendChild(headSpeed);
	headingRow.appendChild(headUv);
	headingRow.appendChild(headSession);
	tableObj.appendChild(headingRow);
	tableDiv.appendChild(tableObj);
	for(var i = 0; i < reportsObject.deviceReports.length; i++){
		var row = document.createElement("tr");
		var lat = document.createElement("td");
		var lon = document.createElement("td");
		var speed = document.createElement("td");
		var uv = document.createElement("td");
		var session = document.createElement("td");
		lat.innerHTML = reportsObject.deviceReports[i].GPS_lat;
		lon.innerHTML = reportsObject.deviceReports[i].GPS_lon;
		speed.innerHTML = reportsObject.deviceReports[i].GPS_speed;
		uv.innerHTML = reportsObject.deviceReports[i].uvLevel;
		session.innerHTML = reportsObject.deviceReports[i].session;
		row.appendChild(lat);
		row.appendChild(lon);
		row.appendChild(speed);
		row.appendChild(uv);
		row.appendChild(session);
		tableObj.appendChild(row);
	}


	

	// var commentsObject = JSON.parse(responseText);
	// for(var i = 0; i < commentsObject.messages.length; i++){
	// 	var commentP = document.createElement("p");
	// 	var commentSpan = document.createElement("span");
	// 	var commentText = document.createTextNode(commentsObject.messages[i].comment);
	// 	commentSpan.innerHTML = commentsObject.messages[i].name;
	// 	commentP.appendChild(commentSpan);
	// 	commentP.appendChild(commentText);
	// 	commentDiv.appendChild(commentP);
	// }



	//data wil be of structure:
	//{"deviceReports": 
	//  [ 
	//  {"deviceID": "value",
	//  "GPS_lat": "value",
	//  "GPS_lon": "value",
	//  "uvLevel": "value",
	//  "session": "value"}
	//  ,
	//  {"deviceID": "value",
	//  "GPS_lat": "value",
	//  "GPS_lon": "value",
	//  "uvLevel": "value",
	//  "session": "value"}
	//  , {...}
	//  ]
	//}
	$("#main").show();
	$("#dataTable").html("<p>hi</p>");
	
	//document.getElementById("body").style.backgroundColor = "red";
} 

//function updateHTML(data, textSatus, jqXHR) {
//	console.log("tried to add data");
//	$("#dataTable").html(data.tableHTML);
//}

function accountInfoError(jqXHR, textStatus, errorThrown) {
   // If authentication error, delete the authToken 
   // redirect user to sign-in page (which is index.html)
   if( jqXHR.status === 401 ) {
      console.log("Invalid auth token");
      window.localStorage.removeItem("authToken");
      window.location.replace("index.html");
   } 
   else {
     
     $("#error").html("Error: " + status.message);
     $("#error").show();
   } 
}

$(function() {
	
	//Normal
	console.log("function called");
	sendReqForAccountInfo();


	//debug
	//console.log("function called");
	//sendReqForAccountInfo();
	
	//reportedData(null, null, null);
});
