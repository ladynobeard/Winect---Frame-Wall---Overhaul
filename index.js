// This code loads the IFrame Player API code asynchronously.
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
var videoLink = 'xGRjCa49C6U';
var videoPos = 5;
var videoLinkNum = 0;
var liveVid = 0;

// This creates an <iframe> (and YouTube player)
// after the API code downloads.
var player;
var playerHeight = 1800;
var playerWidth = 3200;

// This requires os module hich provides a number of operating system-related utility methods
var os = require('os');

// The requires the Kinect V2 module. The next line makes the Kinect2 object
var Kinect2 = require('kinect2');
var kinect = new Kinect2();
var canvas = null;
var DEPTHWIDTH = 0;
var DEPTHHEIGHT = 0;
var currentCamera = null;
var sendAllBodies = false;

// Several parameters needed to pan and zoom scenary 
var X = 0.0;
var Y = 0.0;
var Z = 0.0;
var scaleZ =1;
var scalePow = 0.01;
var startSec = 30;
var handPos = [];

// tracked body number
var trackedBodyIndex = -1;

// Setup AWS IoT
const myWindow = require('./myWindow')
var self = this

window.addEventListener('load', init);

/*
 * init()
 * Called by window.addEventListener('load', init);
 * Pans the scenary to the middle of the screen 
 * and chooses the Kinect depth camera
 * Then it calls the object myWindow to be setup for aws listeners
 */
function init() {
  window.scrollTo($(window).width()/2, $(window).height()/2);
  chooseCamera();
  myWindow.setup();
}

// Listener for IoT event
/*
 * myWindow.onMessage(function(topic, payload) 
 * listens for payload messages from the Alexa
 * Plays scenery according to the user's command in "payload"
 */
myWindow.onMessage(function(topic, payload) {
      if (topic === myWindow.TOPIC_TEXT) {
		//console.log("HERE: "+payload);
		var payloadArray = payload.split(" ");
		var getLive = isLive(payloadArray);
		// Search for video of correct topic
	    if(getLive == 1){ // video is live
			setLiveVideoLink(payloadArray);
			liveVideoLoadandPlay();
			liveVid = 1;
			console.log("it's a live!");
		}
		else if (getLive == 0){ // video is not live
			videoLoadandPlay();
			liveVid = 0;
		}
		else{
			console.log(payloadArray+" not found");
		}
	  }
});

/*
 * isLive(payloadArray)
 * returns 1 if the video is to be live_stream
 * return 0 if the video is not live stream
 */
function isLive(payloadArray)
{
	var i = 0;
	var j = 0;
	for(i = 0; i < payloadArray.length; i++)
	{
		for(j = 0; j < videos.length; j++)
		{
			if(videos[j].label.includes(payloadArray[i]))
			{
				videoLinkNum = Math.floor(Math.random() * videos[j].links.length);
				videosPos = videos[j].pos;
				videoLink = videos[j].links[videoLinkNum];
				//videoLoadandPlay();
				//break;
				return 0;
			}			
		}
	}
	
	i = 0;
	j = 0;
	for(i = 0; i < payloadArray.length; i++)
	{
		for(j = 0; j < liveVideos.length; j++)
		{
			if(liveVideos[j].label.includes(payloadArray[i]))
			{
				videoLinkNum = Math.floor(Math.random() * liveVideos[j].links.length);
				videosPos = liveVideos[j].pos;
				videoLink = liveVideos[j].links[videoLinkNum];
				//videoLoadandPlay();
				//break;
				return 1;
			}			
		}
	}
	
	return -1;
}

/*
 * sets the live video number
 */
function setLiveVideoLink(payloadArray)
{
	for(i = 0; i < payloadArray.length; i++)
	{
		for(j = 0; j < liveVideos.length; j++)
		{
			if(liveVideos[j].label.includes(payloadArray[i]))
			{
				videoLinkNum = Math.floor(Math.random() * liveVideos[j].links.length);
				videosPos = liveVideos[j].pos;
				videoLink = liveVideos[j].links[videoLinkNum];
				//videoLoadandPlay();
				//break;
				return 0;
			}			
		}
	}
}
/*
 * updateWindowScroll(X,Y,Z)
 * Pans and Zooms the scenery 
 * The X, Y, Z positions refer to the position of the user's head
 * The if case serves as a threshold on how much to zoom out (stop zooming if the video is smaller than the container)
 */
function updateWindowScroll(X,Y,Z)
{
	var rect = document.getElementById("player").getBoundingClientRect();
	//if(((rect.top + Math.abs(2*Y*100*(Z*Math.pow(scaleZ*Z,scalePow))))*(((Z*Math.pow(scaleZ*Z,scalePow)))) < -15) )
	{
		window.scrollTo((playerWidth-$(window).width())/2 + X*100*(Z*Math.pow(scaleZ*Z,scalePow)),(playerHeight-$(window).height())/2 - Y*100*(Z*Math.pow(scaleZ*Z,scalePow)));
		document.getElementById("player").style.transform="translateZ("+String((100*Z*Math.pow(scaleZ*Z,scalePow)))+"px)";
		console.log("translateZ("+String((100*Z*Math.pow(scaleZ*Z,scalePow)))+"px)");
	}
}

/*
 * onYouTubeIframeAPIReady()
 * initializes the iframe for youtube api
 */
function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    height: String(playerHeight),
    width: String(playerWidth),

	 playerVars: {
            'controls': 0,
            'showinfo': 0,
            'rel': 0
          },

    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
  });
}


// The Youtube API will call this function when the video player is ready.
function onPlayerReady(event) {
	player.loadVideoById({'videoId': videoLink,
							 'suggestedQuality': 'highres',
				 		 	 'startSeconds': startSec,
				 });
  event.target.setPlaybackQuality('highres');
  event.target.playVideo();
  //liveVideoLoadandPlay();
}

// The Youtube API will call this function when the state of the player changeStateFunction
// Video repeats if it has ended
function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.ENDED) {
        player.playVideo();
    }
}

// Fade in and Fade out animation for when the video is changed
function videoLoadandPlay(){
	$('#player').fadeOut(1000,function(){					
		player.loadVideoById({'videoId': videoLink,
			 'suggestedQuality': 'highres',
			 'startSeconds': startSec,
					 });
		
		player.playVideo();						
		$('#player').fadeIn(1000);
	});
}

// Fade in and Fade out animation for when the live video is changed
function liveVideoLoadandPlay(){
	$('#player').fadeOut(1000,function(){	
	    document.getElementById('player').src = videoLink;//"http://100.80.228.103:8000/index.html"; //videoLink;  
		player.playVideo();	
		$('#player').fadeIn(1000);
	});
}

/*
 * function chooseCamera() 
 * Called by init() 
 * Chooses the Kinect camera for skeleton tracking
 */
function chooseCamera() {
  var camera = "skeleton";
  changeCameraState(camera, 'start');
  currentCamera = camera;
}

/*
 * changeCameraState(camera, state) 
 * changes the state to start
 */
function changeCameraState(camera, state) {
  var cameraCode = 'SkeletonTracking';
  var changeStateFunction;
  sendAllBodies = false;
  changeStateFunction = window[state + cameraCode];
  changeStateFunction();
}

////////////////////////////////////////////////////////////////////////
//////////////////////////// Kinect2 Frames ////////////////////////////
function startSkeletonTracking() {
  //resetCanvas('depth');
  canvasState = 'depth';

  if(kinect.open()) {
    kinect.on('bodyFrame', function(bodyFrame){
      if(sendAllBodies) {
        sendToPeer('bodyFrame', bodyFrame);
        if (doRecord) {
          bodyFrame.record_startime = recordStartTime;
          bodyFrame.record_timestamp = Date.now() - recordStartTime;
          bodyChunks.push(bodyFrame);
        }
      }

      var index = 0;
      bodyFrame.bodies.forEach(function(body){
        if(body.tracked && (index == getClosestBodyIndex(bodyFrame.bodies))) {
          drawSkeleton(body, index);
        }
        index++;
      });
    });
    kinect.openBodyReader();
      }
}

function stopSkeletonTracking() {
  kinect.closeBodyReader();
  kinect.removeAllListeners();
  canvasState = null;
}

function setImageData() {
  imageData = context.createImageData(canvas.width, canvas.height);
  imageDataSize = imageData.data.length;
  imageDataArray = imageData.data;
}

function resetCanvas(size) {
  context.clearRect(0, 0, canvas.width, canvas.height);
  //outputContext.clearRect(0, 0, outputCanvas.width, outputCanvas.height);
  canvas.width = DEPTHWIDTH;
  canvas.height = DEPTHHEIGHT;
}

function getClosestBodyIndex(bodies) {
  var closestZ = Number.MAX_VALUE;
  var closestBodyIndex = -1;
  for(var i = 0; i < bodies.length; i++) {
    if(bodies[i].tracked && bodies[i].joints[Kinect2.JointType.spineMid].cameraZ < closestZ) {
      closestZ = bodies[i].joints[Kinect2.JointType.spineMid].cameraZ;
      closestBodyIndex = i;
    }
  }
  return closestBodyIndex;
}

function drawSkeleton(body, index) {
  // Skeleton variables
  var colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#00ffff', '#ff00ff'];
  //draw joints
  var jointType = 3;
  var joint = body.joints[jointType];
  //console.log("X:"+parseInt(joint.cameraX*1000000)/1000000+" ,Y:"+parseInt(joint.cameraY*1000000)/1000000+" ,Z:"+parseInt(joint.cameraZ*1000000)/1000000)
  X = Math.round(parseInt(joint.cameraX*1000000))/1000000;
  Y = Math.round(parseInt(joint.cameraY*1000000))/1000000;
  Z = Math.round(parseInt(joint.cameraZ*1000000))/1000000;
  
  updateHandState(X, body.rightHandState, body.joints[Kinect2.JointType.handRight]);
  updateWindowScroll(X,Y,Z);
  
}


function updateHandState(headJoint, handState, jointPoint) {
  if (handState == Kinect2.HandState.open) {
	  handPos.push(Math.round(parseInt(jointPoint.cameraX*1000000))/1000000);
	  if(handPos.length > 1)
	  {
		//console.log(headJoint);
		var i;
		var j = 0;
		for (i = 0; i < handPos.length - 1; i++) { 
			switch(checkConsist(headJoint, handPos[i], handPos[i+1])){
				case 1:	
					if(liveVid){
						if(videoLinkNum ==  (liveVideos[videoPos].links.length-1)){
							videoLinkNum = 0;
						}	
						else{
							videoLinkNum = videoLinkNum + 1;							
						}							
						videoLink = liveVideos[videoPos].links[videoLinkNum];
						liveVideoLoadandPlay();			
					}
					else{
						if(videoLinkNum ==  (videos[videoPos].links.length-1)){
							videoLinkNum = 0;
						}	
						else{
							videoLinkNum = videoLinkNum + 1;							
						}	
						videoLink = videos[videoPos].links[videoLinkNum];
						videoLoadandPlay();			
					}		
					handPos = [];
					break;
				case -1:
					if(liveVid){
						if(videoLinkNum == 0){
							videoLinkNum = liveVideos[videoPos].links.length-1;
						}	
						else{
							videoLinkNum = videoLinkNum - 1;							
						}		
						videoLink = liveVideos[videoPos].links[videoLinkNum];	
						liveVideoLoadandPlay();			
					}
					else{
						if(videoLinkNum == 0){
							videoLinkNum = videos[videoPos].links.length-1;
						}	
						else{
							videoLinkNum = videoLinkNum - 1;							
						}	
						videoLink = videos[videoPos].links[videoLinkNum];	
						videoLoadandPlay();				
					}
					handPos = [];
					break;
				default:
					break;
			}
		}		
	  }
  }
  else
  {
	  handPos = [];
  }
}

// check to see if the hand swipes are detected using coordinates
function checkConsist(head, num1, num2) {
	if(((num1 > head) && (num2 > head)) || ((num1 < head) && (num2 < head)))
	{
		return 0;
	}
	else
	{
		if(num1 > num2)
		{
			return -1;
		}
		else
		{
			return 1;
		}
	}
}

