// // import * as blazeface from '@tensorflow-models/blazeface';
// // import * as tf from '@tensorflow/tfjs';
// // let model
// // export const FaceDetection = async (localStream)=>{
// //         console.log(localStream)
// //         if (!model){
// //             model = await blazeface.load();
// //         }
// //         setInterval(() => {
// //           detect(model);
// //         }, 1000);
    
// //     const detect = async (model) => {
// //         console.log(localStream.current)
// //             console.log("detect out")
// //             if (
// //               typeof localStream.current !== "undefined" &&
// //               localStream.current !== null &&
// //               localStream.current.readyState === 4
// //             ) {
// //               console.log("detect in")
// //               const video = localStream.current;        
// //               const predictions = await model.estimateFaces(video, false);
// //               console.log("predictions:", predictions.length)
// //               if (predictions.length > 0) {
// //                 console.log("Number of faces detected:", predictions.length);
// //               } else {
// //                 console.log("No faces detected.");
// //                 // hangUp()
// //                 alert("warning")
// //               }
// //             }
// //     };
// // }



// import React, { useContext, useEffect, useRef } from 'react';
// import { FaceDetection } from '@mediapipe/face_detection';
// import Context from '../../context';

// const FaceDetectionComponent = () => {
//   const {localStream} = useContext(Context)
//   const videoRef = useRef();
//   const canvasRef = useRef();
  
//   useEffect(() => {
//     const runFaceDetection = async () => {
//       // Initialize face detection model
//       const faceDetection = new FaceDetection({
//         locateFile: (file) => {
//             return `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/` + file;
//         }
//       });

//       // Get access to the webcam stream
//       try {
//         // const stream = await navigator.mediaDevices.getUserMedia({ video: true });
//         videoRef.current.srcObject = localStream;
//       } catch (error) {
//         console.error('Error accessing webcam:', error);
//       }

//       // Load the face detection model
//     //   await faceDetection.load();
//     console.log(faceDetection)

//       // Function to detect faces in video frames
//       const detectFaces = async () => {
//         const video = videoRef.current;
//         const canvas = canvasRef.current;
//         const context = canvas.getContext('2d');

//         canvas.width = video.videoWidth;
//         canvas.height = video.videoHeight;

//         // Process video frame for face detection
//         const detections = await faceDetection.send({ image: video });

//         // Clear previous drawings
//         context.clearRect(0, 0, canvas.width, canvas.height);

//         // Draw bounding boxes around detected faces
//         detections.forEach((detection) => {
//           const [x, y, width, height] = detection.boundingBox;
//           context.beginPath();
//           context.lineWidth = 2;
//           context.strokeStyle = 'red';
//           context.rect(x, y, width, height);
//           context.stroke();
//         });

//         // Request next frame
//         requestAnimationFrame(detectFaces);
//       };

//       // Start face detection
//       detectFaces();
//     };

//     runFaceDetection();

//   }, []);

//   return (
//     <div>
//       <video ref={videoRef} autoPlay muted style={{display:"none"}}></video>
//       <canvas ref={canvasRef} width="640" height="480"></canvas>
//     </div>
//   );
// };

// export default FaceDetectionComponent;

