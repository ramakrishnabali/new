// import React, { useEffect, useState, useRef } from 'react';
// import Peer from 'simple-peer';
// import io from "socket.io-client"
// const socket = io.connect('http://localhost:5000')

// const App = () => {
//   const [localStream, setLocalStream] = useState(null);
//   const [remoteStream, setRemoteStream] = useState(null);
//   const [peer, setPeer] = useState(null);
//   const [id,setId] = useState("")
//   const [me,setMe] = useState("")
//   const [ reSingle,setReSingle] = useState()
//   const [isScreenSharing, setIsScreenSharing] = useState(false);
//   const screenStreamRef = useRef(null);
//   const myVideo = useRef()
//   const userVideo = useRef()
//   const [isTrue,setIsTrue] = useState(false)

//   useEffect(() => {
//     navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
//       setLocalStream(stream)
//       if (myVideo.current){
//         myVideo.current.srcObject = stream
//       }
//     })
//     socket.on("me", (id) => {
//       			setMe(id)
//       		})
//     socket.on("callUser",(data)=>{
//       setId(data.from)
//       setReSingle(data.signal)
//       console.log(data.signal)
//     })
    
//   }, []); // Re-run effect when localStream changes

//   const setupPeer = () => {
//     const peer = new Peer({
//       initiator: true, // Client A will initiate the connection
//       stream: localStream, // Local video stream
//       trickle: false, // Disable trickle ICE to speed up connection establishment
//     });

//     peer.on('signal', signal => {
//       console.log('Generated offer signal:', signal);
//       socket.emit("callUser", {
//         				userToCall: id,
//         				signalData: signal,
//         				from: me,
//         			})
//       })

//     peer.on('stream', stream => {
//       console.log('Received remote stream');
//       setRemoteStream(stream);
//       if(userVideo.current){
//         		userVideo.current.srcObject = stream
//       }
//     });

//     socket.on("callAccepted", (signal) => {
//       			peer.signal(signal)
//             console.log(signal)
//             setIsTrue(true)
//     })

//     peer.on('connect', () => {
//       console.log('Peer connection established');
//     });

//     peer.on('error', err => {
//       console.error('Peer connection error:', err);
//     });

//     setPeer(peer);
//   };

//   const answerCall =() =>  {
//     // 		setCallAccepted(true)
//     setIsTrue(true)
//     		const peer = new Peer({
//     			initiator: false,
//     			trickle: false,
//     			stream: localStream
//     		})
//     		peer.on("signal", (data) => {
//           console.log(data)
//     			socket.emit("answerCall", { signal: data, to: id })
//     		})
//     		peer.on("stream", (stream) => {
//           console.log(stream)
//           console.log('Received remote stream');
//       setRemoteStream(stream);
//       if(userVideo.current){
//         userVideo.current.srcObject = stream
//   }
//     		})

//         peer.on('connect', () => {
//           console.log('Peer connection established');
//         });
    
//         peer.on('error', err => {
//           console.error('Peer connection error:', err);
//         });
    
       
    
//     		peer.signal(reSingle)
//     // 		connectionRef.current = peer
//     setPeer(peer);
//     // 	}
// }
// const screenSharingBtn = () => {
//   navigator.mediaDevices.getDisplayMedia({ video: true }).then((screenStream) => {
//     if (peer) {
//       const videoTrack = screenStream.getVideoTracks()[0];
//       const sender = peer._pc.getSenders().find((s) => s.track.kind === videoTrack.kind);

//       if (sender) {
//         setIsScreenSharing(true)
//         sender.replaceTrack(videoTrack);
//       } else {
//         console.error("Sender not found in peer connection.");
//       }
//     } else {
//       console.error("Peer connection not initialized.");
//     }
//   }).catch((error) => {
//     console.error("Error getting screen sharing stream:", error);
//   });
// };

//   const getRemote = (e)=>{
//     setId(e.target.value)
//   }
//   console.log(remoteStream)
//   return (
//     <div>
//       <h1>WebRTC Example</h1>
//       <input type="text" value={me} />
//       <button type='button' onClick={setupPeer} >start</button>
//       <div>
//         <h2>Your Video</h2>
//         {localStream && <video ref={myVideo} autoPlay muted style={{width:"400px",height:"500px"}}/>}
//       </div>
//       <div>
//         <h2>Remote User's Video</h2>
//         <input type="text" value={id} onChange={getRemote} />
//         <button type='button' onClick={answerCall} >Acept</button>
//         {isTrue && <video ref={userVideo} autoPlay style={{width:"400px",height:"500px"}} />}
//       </div>
//       <div>
//         <button onClick={screenSharingBtn} disabled={isScreenSharing}>
//           {isScreenSharing ? 'Screen Sharing' : 'Start Screen Share'}
//         </button>
//       </div>
//     </div>
//   );

// }

// export default App;


// import React, { useEffect, useState, useRef } from 'react';
// import Peer from 'simple-peer';
// import io from "socket.io-client"

// const socket = io.connect('http://localhost:5000');

// const App = () => {
//   const [localStream, setLocalStream] = useState(null);
//   const [remoteStream, setRemoteStream] = useState(null);
//   const [isTrue,setIsTrue] = useState(false)
//   const [peer, setPeer] = useState(null);
//   const [id, setId] = useState("");
//   const [me, setMe] = useState("");
//   const [reSingle, setReSingle] = useState();
//   const [isScreenSharing, setIsScreenSharing] = useState(false);
//   const screenStreamRef = useRef(null);
//   const myVideo = useRef();
//   const userVideo = useRef();
//   const [isAudioMuted, setIsAudioMuted] = useState(false);
//   const [isVideoMuted, setIsVideoMuted] = useState(false);

//   useEffect(() => {
//     navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
//       setLocalStream(stream);
//       if (myVideo.current) {
//         myVideo.current.srcObject = stream;
//       }
//     });
//     socket.on("me", (id) => {
//       setMe(id);
//     });
//     socket.on("callUser", (data) => {
//       setId(data.from);
//       setReSingle(data.signal);
//     });
//   }, []);

//   const setupPeer = () => {
//     const peer = new Peer({
//       initiator: true,
//       stream: localStream,
//       trickle: false,
//     });

//     peer.on('signal', signal => {
//       console.log('Generated offer signal:', signal);
//       socket.emit("callUser", {
//         userToCall: id,
//         signalData: signal,
//         from: me,
//       });
//     });

//     peer.on('stream', stream => {
//       console.log('Received remote stream');
//       setRemoteStream(stream);
//       if (userVideo.current) {
//         userVideo.current.srcObject = stream;
//       }
//     });

//     socket.on("callAccepted", (signal) => {
//       peer.signal(signal);
//       setIsTrue(true);
//     });

//     peer.on('connect', () => {
//       console.log('Peer connection established');
//     });

//     peer.on('error', err => {
//       console.error('Peer connection error:', err);
//     });

//     setPeer(peer);
//   };

//   const answerCall = () => {
//     setIsTrue(true);
//     const peer = new Peer({
//       initiator: false,
//       trickle: false,
//       stream: localStream,
//     });

//     peer.on("signal", (data) => {
//       socket.emit("answerCall", { signal: data, to: id });
//     });

//     peer.on("stream", (stream) => {
//       setRemoteStream(stream);
//       if (userVideo.current) {
//         userVideo.current.srcObject = stream;
//       }
//     });

//     peer.on('connect', () => {
//       console.log('Peer connection established');
//     });

//     peer.on('error', err => {
//       console.error('Peer connection error:', err);
//     });

//     peer.signal(reSingle);
//     setPeer(peer);
//   };

//   const screenSharingBtn = () => {
//     navigator.mediaDevices.getDisplayMedia({ video: true }).then((screenStream) => {
//       if (peer) {
//         const videoTrack = screenStream.getVideoTracks()[0];
//         const sender = peer._pc.getSenders().find((s) => s.track.kind === videoTrack.kind);

//         if (sender) {
//           setIsScreenSharing(true);
//           sender.replaceTrack(videoTrack);
//         } else {
//           console.error("Sender not found in peer connection.");
//         }
//       } else {
//         console.error("Peer connection not initialized.");
//       }
//     }).catch((error) => {
//       console.error("Error getting screen sharing stream:", error);
//     });
//   };

//   const toggleAudioMute = () => {
//     localStream.getAudioTracks().forEach(track => {
//       track.enabled = !track.enabled;
//     });
//     setIsAudioMuted(!isAudioMuted);
//   };

//   const toggleVideoMute = () => {
//     localStream.getVideoTracks().forEach(track => {
//       track.enabled = !track.enabled;
//     });
//     setIsVideoMuted(!isVideoMuted);
//   };

//   const getRemote = (e) => {
//     setId(e.target.value);
//   };

//   return (
//     <div>
//       <h1>WebRTC Example</h1>
//       <input type="text" value={me} />
//       <button type='button' onClick={setupPeer}>Start</button>
//       <div>
//         <h2>Your Video</h2>
//         {localStream && <video ref={myVideo} autoPlay muted style={{ width: "400px", height: "500px" }} />}
//         <button onClick={toggleAudioMute}>{isAudioMuted ? 'Unmute Audio' : 'Mute Audio'}</button>
//         <button onClick={toggleVideoMute}>{isVideoMuted ? 'Unmute Video' : 'Mute Video'}</button>
//       </div>
//       <div>
//         <h2>Remote User's Video</h2>
//         <input type="text" value={id} onChange={getRemote} />
//         <button type='button' onClick={answerCall}>Accept</button>
//         {isTrue && <video ref={userVideo} autoPlay style={{ width: "400px", height: "500px" }} />}
//       </div>
//       <div>
//         <button onClick={screenSharingBtn} disabled={isScreenSharing}>
//           {isScreenSharing ? 'Screen Sharing' : 'Start Screen Share'}
//         </button>
//       </div>
//     </div>
//   );
// };

// export default App;


import React, { useEffect, useState, useRef } from 'react';
import {BrowserRouter, Routes,Route} from "react-router-dom"
import Context from './context';
import { SocketContext } from './socketContect';

import Home from './components/home/home';
import Video from './components/video/video';
import io from "socket.io-client"



const App = ()=>{
  const [name,setName] = useState("")
  const [socket, setSocket] = useState(null)
  const [socketId,setSocketId] = useState("")
  const [localStream,setLocalStream] = useState(null)
  useEffect(()=>{
    if (!socket){
       const connection = io.connect('http://localhost:3005');
       setSocket(connection)

       connection.on("me", (id) => {
        setSocketId(id);
      });

    }
  },[])

  const updateName = (value)=>{
    setName(value)
  }

  const getLocalStream = (stream)=>{
        setLocalStream(stream)
  }
return(
  <BrowserRouter>
  <SocketContext.Provider value={socket}>
  <Context.Provider value={{name,updateName,socketId,localStream,getLocalStream}}>
  <Routes>
    <Route exact path="/" element={<Home />} />
    <Route exact path='/video' element ={<Video />} />
  </Routes>
  </Context.Provider>
  </SocketContext.Provider>
  </BrowserRouter>
)
}

export default App

