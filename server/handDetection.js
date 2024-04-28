// import * as tf from "@tensorflow/tfjs";
// import * as handpose from "@tensorflow-models/handpose";

const tf = require('@tensorflow/tfjs');
const handpose  = require("@tensorflow-models/handpose")


const detect = async (net,image) => {
    const hand = await net.estimateHands(image);
    console.log(hand)
  //   if (hand.length > 0) { 
  //     const GE = new fp.GestureEstimator([
  //       thumbsUpGesture,
  //       handRaiseGesture,
  //       victoryGesture

  //     ]);
  //     //  console.log(GE.gestures)
  //     const gesture = await GE.estimate(hand[0].landmarks, 4);
  //     // console.log(gesture)
  //     if (gesture.gestures !== undefined && gesture.gestures.length > 0) {
  //       // console.log(gesture.gestures);

  //       const confidence = gesture.gestures.map(
  //         (prediction) => prediction.confidence
  //       );
  //       const maxConfidence = confidence.indexOf(
  //         Math.max.apply(null, confidence)
          
  //       );

  //       const maxConfidenceGesture = gesture.gestures[maxConfidence];
  //       console.log(maxConfidenceGesture)
  //       // console.log(gesture.gestures[maxConfidence]);
  //       const VICTORY_THRESHOLD = 8.5;
  //       const HANDRISE_THRESHOLD = 9.0;
  //       const THUMBSUP_THRESHOLD = 9.0;
  //       const THUMBSDOWN_THRESHOLD = 9.5;
  //       const isThumbUp = isThumbsUp(hand[0].landmarks);
  //       if ( maxConfidenceGesture.name === "victory" && maxConfidenceGesture.confidence >= VICTORY_THRESHOLD) {
  //         setEmoji("victory");
  //         setMsg("")
  //       } else if (maxConfidenceGesture.name === "hand_raise" && maxConfidenceGesture.confidence >= HANDRISE_THRESHOLD){
  //         setEmoji("hand_raise")
  //         setMsg("Have Doubt")
  //       }else if (maxConfidenceGesture.name === "thumbs_up" && maxConfidenceGesture.confidence >= THUMBSUP_THRESHOLD && isThumbUp){
  //         setEmoji("thumbs_up")
  //         setMsg("")
  //       }else if (maxConfidenceGesture.name === "thumbs_down" && maxConfidenceGesture.confidence >= THUMBSDOWN_THRESHOLD){
  //         console.log("thumbs down")
  //       }
  //     }

  //   }
};


const RunHandpose = async (image) => {
    const data = await handpose.load()
    console.log("last")
    setInterval(() => {
      detect(data,image);
    }, 500);
    
    console.log("Handpose model loaded.");
  };

  module.exports = {RunHandpose}