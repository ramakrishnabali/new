import { SelfieSegmentation } from '@mediapipe/selfie_segmentation';
import * as blazeface from '@tensorflow-models/blazeface';
import * as tf from '@tensorflow/tfjs';
import { useContext, useEffect,useRef,useState} from 'react';
import Context from '../../context';
import nature1 from "./assets/nature1.jpg"
import home from "./assets/home.jpg"
import office from "./assets/office.jpg"
import nature from "./assets/nature.jpg"

import SpeechRecognition from "../speech/SpeechRecognition"
let count = "home"
const bgList = {"home":home,"office":office,"nature":nature,"nature1":nature1}

let canvasStream
const VirtualBackground  = ({onCanvasStreamChange})=>{
    const {localStream} = useContext(Context)
    const localVideoRef = useRef(null)
    const canvasRef = useRef(null)
    const imgRef = useRef(null)
    const [bg,setBg] = useState(bgList.count)

    const getbg = (value)=>{
      console.log("imaged",value)
      setBg(bgList.value)
}

    useEffect(()=>{
      SpeechRecognition(getbg)
        if (localStream) {
            console.log(localStream)
            
            const videoElement = localVideoRef.current;
            videoElement.srcObject = localStream;
      
            videoElement.onloadedmetadata = () => {
              videoElement.play();
            };
          const canvasElement = canvasRef.current;
          const canvasCtx = canvasElement.getContext('2d');
      
          const onResultsSelfieSegmentation = (results) => {
            const img = imgRef.current
            canvasElement.width = videoElement.videoWidth;
            canvasElement.height = videoElement.videoHeight;
            canvasCtx.save();
            canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
            canvasCtx.globalCompositeOperation = 'destination-atop';
            canvasCtx.drawImage(results.segmentationMask, 0, 0,
            canvasElement.width, canvasElement.height);
      
            canvasCtx.globalCompositeOperation = 'source-in';
            canvasCtx.drawImage(
              results.image, 0, 0, canvasElement.width, canvasElement.height);
      
            canvasCtx.globalCompositeOperation = 'destination-over';
            canvasCtx.drawImage(img,0, 0, canvasElement.width, canvasElement.height);
            // canvasCtx.restore();
              
            const stream = canvasElement.captureStream();
                // setCanvasStream(stream); // Update canvasStream state
                onCanvasStreamChange(stream);      
           }
      
          const selfieSegmentation = new SelfieSegmentation({
            locateFile: (file) => {
              return `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/` + file;
            }
          });
      
          selfieSegmentation.setOptions({
            modelSelection: 0,
          });
      
          selfieSegmentation.onResults(onResultsSelfieSegmentation);
      
        //   selfieSegmentation.send({ image: videoElement });
          const intervalId = setInterval(() => {
            if (!videoElement.videoWidth || !videoElement.videoHeight) return; // Skip frames if video dimensions are not available
             selfieSegmentation.send({ image: videoElement });
             
          }, 100); // Adjust the interval as needed
      
      
          return () => {
            clearInterval(intervalId);
            selfieSegmentation.close();
          };
          }


    },[])

    return (
        <>
            <video ref={localVideoRef} style={{ display: 'none' }} />
            <canvas ref={canvasRef} style={{ width:"150px", height:"200px" }} />
            <img ref={imgRef} id="imgId" src={bg} alt='bgImg' style={{display:"none"}}/>
            {/* Add any other elements you need */}
        </>
    );

}

export default VirtualBackground
