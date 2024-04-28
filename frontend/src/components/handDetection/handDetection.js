// import * as tf from "@tensorflow/tfjs";
// import * as handpose from "@tensorflow-models/handpose";

// // Function to load Handpose model using a proxy URL
// const loadHandposeModel = async () => {
//     // Proxy URL to bypass CORS restrictions
//     const proxyUrl = "https://cors-anywhere.herokuapp.com/";
//     const modelUrl = "https://www.kaggle.com/models/mediapipe/handskeleton/tfJs/default/1/group1-shard1of2.bin?tfjs-format=file&tfhub-redirect=true";
    
//     // Load the Handpose model using the proxy URL
//     const net = await tf.loadGraphModel(proxyUrl + modelUrl);
//     return net;
// };

// const handDetection = async (myVideo) => {
//     console.log("!!!hand detect", myVideo);

//     // Load Handpose model using the proxy
//     const net = await loadHandposeModel();

//     const detect = async (net) => {
//         console.log("!!!hand detect Detect", net);
//         const video = myVideo.current;
//         console.log("!!!hand detect video", video);
//         // Perform hand detection on the video stream using the loaded model
//         // Add your detection logic here
//     };

//     detect(net);
// };

// export default handDetection;




import React, { useRef, useState, useEffect, useContext } from "react";
import * as tf from "@tensorflow/tfjs";
import * as handpose from "@tensorflow-models/handpose";

import * as fp from "fingerpose";
import victory from "./assets/victory.png";
import thumbs_up from "./assets/thumbs_up.png";
import handRaiseEmoji from "./assets/handRiseEmoji.jpg";
import Context from "../../context";

const handRaiseGesture = new fp.GestureDescription('hand_raise');
handRaiseGesture.addCurl(fp.Finger.Thumb, fp.FingerCurl.NoCurl, 1.0);
handRaiseGesture.addCurl(fp.Finger.Index, fp.FingerCurl.NoCurl, 1.0);
handRaiseGesture.addCurl(fp.Finger.Middle, fp.FingerCurl.NoCurl, 1.0);
handRaiseGesture.addCurl(fp.Finger.Ring, fp.FingerCurl.NoCurl, 1.0);
handRaiseGesture.addCurl(fp.Finger.Pinky, fp.FingerCurl.NoCurl, 1.0);
handRaiseGesture.addDirection(fp.Finger.Index, fp.FingerDirection.VerticalUp, 1.0);
handRaiseGesture.addDirection(fp.Finger.Middle, fp.FingerDirection.VerticalUp, 1.0);
handRaiseGesture.addDirection(fp.Finger.Ring, fp.FingerDirection.VerticalUp, 1.0);
handRaiseGesture.addDirection(fp.Finger.Pinky, fp.FingerDirection.VerticalUp, 1.0);
// handRise.addDirection(fp.Finger.Thumb, fp.FingerDirection.DiagonalUpLeft, 1.0);

const thumbsUpGesture = new fp.GestureDescription('thumbs_up');
thumbsUpGesture.addCurl(fp.Finger.Thumb, fp.FingerCurl.NoCurl, 1.0);
thumbsUpGesture.addCurl(fp.Finger.Index, fp.FingerCurl.FullCurl, 1.0);
thumbsUpGesture.addCurl(fp.Finger.Middle, fp.FingerCurl.FullCurl, 1.0);
thumbsUpGesture.addCurl(fp.Finger.Ring, fp.FingerCurl.FullCurl, 1.0);
thumbsUpGesture.addCurl(fp.Finger.Pinky, fp.FingerCurl.FullCurl, 1.0);
thumbsUpGesture.addCurl(fp.Finger.Index, fp.FingerCurl.HalfCurl, 0.9);
thumbsUpGesture.addCurl(fp.Finger.Middle, fp.FingerCurl.HalfCurl, 0.9);
thumbsUpGesture.addCurl(fp.Finger.Ring, fp.FingerCurl.HalfCurl, 0.9);
thumbsUpGesture.addCurl(fp.Finger.Pinky, fp.FingerCurl.HalfCurl, 0.9);
thumbsUpGesture.addDirection(fp.Finger.Thumb, fp.FingerDirection.VerticalUP, 0.9);
// thumbsUpGesture.addDirection(fp.Finger.Index, fp.FingerDirection.HorizontalLeft, 0.5);
// thumbsUpGesture.addDirection(fp.Finger.Middle, fp.FingerDirection.HorizontalLeft, 0.5);
// thumbsUpGesture.addDirection(fp.Finger.Ring, fp.FingerDirection.HorizontalLeft, 0.5);
// thumbsUpGesture.addDirection(fp.Finger.Pinky, fp.FingerDirection.HorizontalLeft, 0.5);
// thumbsUpGesture.addDirection(fp.Finger.Index, fp.FingerDirection.HorizontalRight, 0.5);
// thumbsUpGesture.addDirection(fp.Finger.Middle, fp.FingerDirection.HorizontalRight, 0.5);
// thumbsUpGesture.addDirection(fp.Finger.Ring, fp.FingerDirection.HorizontalRight, 0.5);
// thumbsUpGesture.addDirection(fp.Finger.Pinky, fp.FingerDirection.HorizontalRight, 0.5);


const victoryGesture = new fp.GestureDescription('victory');
victoryGesture.addCurl(fp.Finger.Thumb, fp.FingerCurl.HalfCurl, 1.0);
victoryGesture.addCurl(fp.Finger.Index, fp.FingerCurl.NoCurl, 1.0);
victoryGesture.addCurl(fp.Finger.Middle, fp.FingerCurl.NoCurl, 1.0);
victoryGesture.addCurl(fp.Finger.Ring, fp.FingerCurl.FullCurl, 1.0);
victoryGesture.addCurl(fp.Finger.Pinky, fp.FingerCurl.FullCurl, 1.0);
// victoryGesture.addDirection(fp.Finger.Thumb, fp.FingerDirection.VerticalUp, 0.5);
// victoryGesture.addDirection(fp.Finger.Index, fp.FingerDirection.VerticalUp, 1.0);
// victoryGesture.addDirection(fp.Finger.Middle, fp.FingerDirection.VerticalUp, 1.0);
// victoryGesture.addDirection(fp.Finger.Ring, fp.FingerDirection.VerticalDown, 0.5);
// victoryGesture.addDirection(fp.Finger.Pinky, fp.FingerDirection.VerticalDown, 0.5);


const HandDetection = () => {
    const {localStream} = useContext(Context)
  const videoRef = useRef(null);
  const [emoji, setEmoji] = useState(null);
  const [msg, setMsg] = useState("");
  const images = { thumbs_up: thumbs_up, victory: victory, hand_raise: handRaiseEmoji };

  useEffect(() => {
    // const constraints = {
    //   video: true,
    // };

    // const startVideo = async () => {
    //   try {
    //     const stream = await navigator.mediaDevices.getUserMedia(constraints);
    //     if (videoRef.current) {
    //       videoRef.current.srcObject = stream;
    //       videoRef.current.play()
    //     }
    //   } catch (err) {
    //     console.error("Error accessing webcam:", err);
    //   }
    // };

    // startVideo();
    runHandpose()

    // return () => {
    //   if (videoRef.current && videoRef.current.srcObject) {
    //     const stream = videoRef.current.srcObject;
    //     const tracks = stream.getTracks();
    //     tracks.forEach((track) => track.stop());
    //     videoRef.current.srcObject = null;
    //   }
    // };
  }, []);

  const isThumbsUp = (keypoints) => {
    // Define keypoints indices for thumb and fingers
    console.log("keypoints:", keypoints)
    const thumbTip = keypoints[4];
    const thumbBase = keypoints[2];

// Define keypoints indices for index finger pointing up gesture
const indexTip = keypoints[8];
const middleTip = keypoints[12];
const ringTip = keypoints[16]
const pinkyTip = keypoints[20]
const indexBase = keypoints[5];

// // Define keypoints indices for victory gesture
const victoryTip = keypoints[8];
const victoryMiddle = keypoints[12];
const victoryBase = keypoints[0];

// // Define keypoints indices for wave hand gesture
const waveIndex = keypoints[8];
const waveMiddle = keypoints[12];
const waveRing = keypoints[16];
const wavePinky = keypoints[20];

const isThumbsUp = thumbTip[1] < indexTip[1] && thumbTip[1] < middleTip[1] && thumbTip[2] > 0;;
console.log("thumb", isThumbsUp)


    if(isThumbsUp){
      return "thumb"
    }
    // else if(isIndexPointingUp){
    //   return "index"
    // }else if(isVictory){
    //   return "victory"
    // }else{
    //   return "wave"
    // }
  };

  const runHandpose = async () => {
    console.log("strated")
    const MODEL_URL = 'https://www.kaggle.com/models/mediapipe/handskeleton/tfJs/default/1/anchors.json?tfjs-format=file&tfhub-redirect=true';
    const PROXY_URL = 'https://cors-anywhere.herokuapp.com/'; // Example CORS proxy service URL
    console.log("middle")
    const response = await fetch(PROXY_URL+ MODEL_URL);
    console.log("ended")
    const data = await response.json();
    console.log("last")
    setInterval(() => {
      detect(data);
    }, 500);
    
    console.log("Handpose model loaded.");
  };

  const detect = async (net) => {
    const videoElement = videoRef.current;
            videoElement.srcObject = localStream;
      
            videoElement.onloadedmetadata = () => {
              videoElement.play();
            };

    if (videoElement && videoElement.readyState === 4) {
      const hand = await net.estimateHands(videoElement);
      if (hand.length > 0) { 
        const GE = new fp.GestureEstimator([
          thumbsUpGesture,
          handRaiseGesture,
          victoryGesture

        ]);
        //  console.log(GE.gestures)
        const gesture = await GE.estimate(hand[0].landmarks, 4);
        // console.log(gesture)
        if (gesture.gestures !== undefined && gesture.gestures.length > 0) {
          // console.log(gesture.gestures);

          const confidence = gesture.gestures.map(
            (prediction) => prediction.confidence
          );
          const maxConfidence = confidence.indexOf(
            Math.max.apply(null, confidence)
            
          );

          const maxConfidenceGesture = gesture.gestures[maxConfidence];
          console.log(maxConfidenceGesture)
          // console.log(gesture.gestures[maxConfidence]);
          const VICTORY_THRESHOLD = 8.5;
          const HANDRISE_THRESHOLD = 9.0;
          const THUMBSUP_THRESHOLD = 9.0;
          const THUMBSDOWN_THRESHOLD = 9.5;
          const isThumbUp = isThumbsUp(hand[0].landmarks);
          if ( maxConfidenceGesture.name === "victory" && maxConfidenceGesture.confidence >= VICTORY_THRESHOLD) {
            setEmoji("victory");
            setMsg("")
          } else if (maxConfidenceGesture.name === "hand_raise" && maxConfidenceGesture.confidence >= HANDRISE_THRESHOLD){
            setEmoji("hand_raise")
            setMsg("Have Doubt")
          }else if (maxConfidenceGesture.name === "thumbs_up" && maxConfidenceGesture.confidence >= THUMBSUP_THRESHOLD && isThumbUp){
            setEmoji("thumbs_up")
            setMsg("")
          }else if (maxConfidenceGesture.name === "thumbs_down" && maxConfidenceGesture.confidence >= THUMBSDOWN_THRESHOLD){
            console.log("thumbs down")
          }
        }

      }
      else{
        setEmoji(null)
        setMsg("")
      }

    }
  };


  return (
    <div className="App">
      <header className="App-header">

<video
          ref={videoRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zindex: 9,
            width: "20%",
            height: 480,
          }}
        />

        {emoji !== null ? (
          <img
            src={images[emoji]}
            alt = "emoji"
            style={{
              position: "absolute",
              marginLeft: "auto",
              marginRight: "auto",
              left: 400,
              bottom: 500,
              right: 0,
              textAlign: "center",
              height: 100,
              zindex: 10
            }}
          />
        ) : (
          ""
        )}
{msg && <p style={{
              position: "absolute",
              marginLeft: "auto",
              marginRight: "auto",
              left: 10,
              bottom:400,
              right: 0,
              textAlign: "center",
              height: 100,
              color: "red"
            }}>{msg}</p>}
      </header>
    </div>
  );
}

export default HandDetection;