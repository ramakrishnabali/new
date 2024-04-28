import { useEffect, useState,useRef, useContext } from "react"
import Peer from 'simple-peer';
import Context from "../../context";
import { useSocket } from "../../socketContect";
import  VirtualBackground  from "../virtualBackground/virtualBackground";
import HandDetection from "../handDetection/handDetection"
import  FaceDetection  from "../faceDetection/faceDetection";
import SpeechRecognition from "../speech/SpeechRecognition";
import "./video.css"
import { image } from "@tensorflow/tfjs";

let sendFramesInterval

const Video = ()=>{
    const socket = useSocket()
    const {name,socketId,getLocalStream} = useContext(Context)
    const [remoteUser,setRemoteUser] = useState("")
    const [localStream, setLocalStream] = useState(null);
    const [isTrue,setIsTrue] = useState(false)
    const [incomingCall,setIncomingcall] = useState(false)
    const [buttons,setButtons] = useState(false)
    const [isMute,setIsMute] = useState(false)
    const [isVideoMuted,setIsVideoMuted] = useState(false)
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [isAddedVG,setVG] = useState(false)
    const [peer, setPeer] = useState(null);
    const [reSingle, setReSingle] = useState();
    const canvasRef = useRef(null)

    const myVideo = useRef();
    const userVideo = useRef();
    const [canvasStream, setCanvasStream] = useState(null);

    // const getbg = (value)=>(
    //   console.log("imaged",value)
    // )

  
  useEffect(()=>{
    // localStream.setItem(name,socketId)
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
               setLocalStream(stream);
               getLocalStream(stream)
              //  FaceDetection(stream)
               if (myVideo.current) {
                 myVideo.current.srcObject = stream;
               }
             });

            //  const bgName = SpeechRecognition(getbg)
            // console.log("vbggggggggggggggggggg",bgName)

             socket.on("callUser", (data) => {
                    setRemoteUser(data.from);
                      setReSingle(data.signal);
                        setIncomingcall(true)
                    });
  },[isAddedVG])


  const setupPeer = () => {
    const id = localStorage.getItem(remoteUser)
        const peer = new Peer({
          initiator: true,
          stream: localStream,
          trickle: false,
        });
    
        peer.on('signal', signal => {
          console.log('Generated offer signal:', signal);
          socket.emit("callUser", {
            userToCall: id,
            signalData: signal,
            from: name,
          });
        });
    
        peer.on('stream', stream => {
          console.log('Received remote stream');
        //   setRemoteStream(stream);
          if (userVideo.current) {
            userVideo.current.srcObject = stream;
          }
        });
    
        socket.on("callAccepted", (signal) => {
          peer.signal(signal);
          setIsTrue(true);
          setIncomingcall(true)
          setButtons(true)
        });
    
        peer.on('connect', () => {
          console.log('Peer connection established');
        });
    
        peer.on('error', err => {
          console.error('Peer connection error:', err);
        });
    
        setPeer(peer);
      };

  const answerCall = () => {
        setIsTrue(true);
        setButtons(true)
        const id = localStorage.getItem(remoteUser)
        const peer = new Peer({
          initiator: false,
          trickle: false,
          stream: localStream,
        });
    
        peer.on("signal", (data) => {
          socket.emit("answerCall", { signal: data, to: id });
        });
    
        peer.on("stream", (stream) => {
        //   setRemoteStream(stream);
          if (userVideo.current) {
            userVideo.current.srcObject = stream;
          }
        });
    
        peer.on('connect', () => {
          console.log('Peer connection established');
        });
    
        peer.on('error', err => {
          console.error('Peer connection error:', err);
        });
    
        peer.signal(reSingle);
        setPeer(peer);
      };

  const toggleAudioMute = () => {
            localStream.getAudioTracks().forEach(track => {
              track.enabled = !track.enabled;
            });
            setIsMute(!isMute);
      };
        
  const toggleVideoMute = () => {
      localStream.getVideoTracks().forEach(track => {
          track.enabled = !track.enabled;
      });
      setIsVideoMuted(!isVideoMuted);
  };

const addVirtualBackground = ()=>{
    if (isScreenSharing === false && !isAddedVG){
      setVG(true)
    }else{
      setVG(false)
      if (peer) {
        console.log("removed vg")
        const videoTrack = localStream.getVideoTracks()[0];
        const sender = peer._pc.getSenders().find((s) => s.track.kind === videoTrack.kind);
        if (sender) {
          sender.replaceTrack(videoTrack);
        } else {
          console.error("Sender not found in peer connection.");
        }
      } else {
        console.error("Peer connection not initialized.");
        }
    }
}

const sendFrames = async ()=>{
   sendFramesInterval = setInterval(() => {
    const myVideo = document.getElementById('myVideo');
// Create a canvas element and draw the video frame on it
    const canvas = document.createElement("canvas");
    canvas.width = myVideo.videoWidth;
    canvas.height = myVideo.videoHeight;
    const context = canvas.getContext("2d");
    context.drawImage(myVideo, 0, 0, canvas.width, canvas.height);

// Convert the canvas content to a data URL
// const imageDataUrl = canvas.toDataURL("image/jpeg");


// Send the data URL to the server
// fetch("http://localhost:5000/frame", {
//     method: 'POST',
//     body: JSON.stringify({ imageDataUrl }), // Send as JSON
//     headers: {
//         'Content-Type': 'application/json'
//     }
// });
canvas.toBlob((blob) => {
    const formData = new FormData();
    formData.append('frame', blob);
    fetch("http://localhost:3005/video_feed", {
        method: 'POST',
        body: formData,
    }).then(response => {

      console.log('Response:=====', response);
      // Check if the response is successful (status code 200)
      if (response.ok) {
        response.json().then(data=>{
          const detectedGesture = data.message
    
          // Use the value of 'X-Detected-Gesture'
          console.log('Detected Gesture:', detectedGesture);
        })
        // Access the custom header 'X-Detected-Gesture'
       
        
        // Now you can do something with 'detectedGesture', like update your UI
      } else {
        console.error('Error:', response.statusText);
      }
    })
    .catch(error => {
      console.error('Error:', error);
    });
}, 'image/jpeg')
}, 1000);
  // const canvasElement = myVideo.current;
  // const canvasCtx = canvasElement.getContext('2d');
  // console.log(localStream.getVideoTracks()[0])
  // console.log(myVideo.current)
  // canvasCtx.drawImage(myVideo.current, 0, 0, canvasElement.width, canvasElement.height);
  // const frameData = canvasCtx.toDataUrl('image/jpeg')
  

  // const pythonUrl = "http://127.0.0.1:5000/page"
  // const options = {
  //   method:"POST"
  // }
}

const screenSharingBtn = async () => {
      if (!isScreenSharing){
        navigator.mediaDevices.getDisplayMedia({ video: true }).then(async (screenStream) => {
          if (peer) {
            const videoTrack = screenStream.getVideoTracks()[0];
            const sender = peer._pc.getSenders().find((s) => s.track.kind === videoTrack.kind);
    
            if (sender) {
              setIsScreenSharing(true);
              sender.replaceTrack(videoTrack);
              sendFrames()
            } else {
              console.error("Sender not found in peer connection.");
            }
          } else {
            console.error("Peer connection not initialized.");
          }
        }).catch((error) => {
          console.error("Error getting screen sharing stream:", error);
        });
      }else{
        if (peer) {
          const videoTrack = localStream.getVideoTracks()[0];
          const sender = peer._pc.getSenders().find((s) => s.track.kind === videoTrack.kind);
  
          if (sender) {
            setIsScreenSharing(false);
            sender.replaceTrack(videoTrack);
          } else {
            console.error("Sender not found in peer connection.");
          }
        } else {
          console.error("Peer connection not initialized.");
          }
        }
  }

  const handleCanvasStreamChange = (stream) => {
    if (isAddedVG && isScreenSharing === false){
      setCanvasStream(stream);
      if (peer) {
        const videoTrack = stream.getVideoTracks()[0];
        const sender = peer._pc.getSenders().find((s) => s.track.kind === videoTrack.kind);
        if (sender) {
          sender.replaceTrack(videoTrack);
        } else {
          console.error("Sender not found in peer connection.");
        }
      } else {
        console.error("Peer connection not initialized.");
      }
    }
  };   // after getting canvas stream we need to add stream of peer and after remove bg we can update peer with local stream
  
    return(
        <div className="video-container">
        <canvas ref={canvasRef} style={{ display:"none",width: "80%", height:"450px"}} />
            <p className="heading">Hello {name}</p>
                   {!buttons && 
                   <div>  
                        <input  type="text" value={remoteUser} onChange={(e)=>setRemoteUser(e.target.value)} placeholder="Remote User Name"/>
                        {!incomingCall && <button type="button" onClick={setupPeer} >Invite User</button>}
                        {incomingCall && <button type='button' onClick={answerCall}>Accept</button>}
                    </div>
                    }
            <div className="user-video-conatainer">
                {isAddedVG && <VirtualBackground onCanvasStreamChange={handleCanvasStreamChange}/>}
                {!isAddedVG && <video id="myVideo" ref={myVideo} autoPlay muted style={{ width: "20%" }} />}
                {/* {!isAddedVG && < HandDetection />} */}
                {/* {!isAddedVG && <FaceDetection />} */}
                {isTrue && <video ref={userVideo} autoPlay style={{ width: "80%", height:"450px" }}/>}
            </div>
            <div className="bottom-container">
                 <button type="button" className="bottom-button"  onClick={toggleAudioMute}>{isMute ? 'Unmute Audio' : 'Mute Audio'}</button>
                <button type="button" className="bottom-button" onClick={toggleVideoMute}>{isVideoMuted ? 'Unmute Video' : 'Mute Video'}</button>
                <button type="button" className="bottom-button" onClick={addVirtualBackground}>{isAddedVG ? 'Remove BG' : 'add BG'}</button>
                <button type="button" className="bottom-button" onClick={screenSharingBtn}>
           {isScreenSharing ? 'Stop Screen Sharing' : 'Start Screen Share'}
         </button>

            </div>
        </div>
    )
    
}
export default Video