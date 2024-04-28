// const express = require("express")
// const http = require("http")
// const app = express()
// const server = http.createServer(app)

// const io = require("socket.io")(server, {
// 	cors: {
// 		origin: "http://localhost:3001",
// 		methods: [ "GET", "POST" ]
// 	}
// })

// io.on('connection', socket => {
//   console.log('New client connected');

//   socket.on('offer', offer => {
//     socket.broadcast.emit('offer', offer);
//   });

//   socket.on('answer', answer => {
//     socket.broadcast.emit('answer', answer);
//   });

//   socket.on('ice-candidate', candidate => {
//     console.log(candidate)
//     socket.broadcast.emit('ice-candidate', candidate);
//   });

//   socket.on('disconnect', () => {
//     console.log('Client disconnected');
//   });
// });

// const PORT = process.env.PORT || 5000;
// server.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });


const express = require("express")
const http = require("http")
const app = express()
const bodyParser = require("body-parser");
const sharp = require("sharp");
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require("cors")
const tf = require('@tensorflow/tfjs');
const handpose  = require("@tensorflow-models/handpose")
// const { createCanvas, loadImage } = require('canvas');
const Jimp = require('jimp');
const server = http.createServer(app)
const io = require("socket.io")(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: [ "GET", "POST" ]
    }
})
// import {RunHandpose} from "./handDetection"
// const {RunHandpose} = require("./handDetection");
app.use(cors())
app.use(express.json())
app.use(bodyParser.json());

// let detector;
// async function initializeHandpose() {
//     detector = await handpose.load();
//     console.log('Handpose model loaded');
// }
// initializeHandpose();

let detectorPromise


// Multer configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'received_images')  // Destination folder
    },
    filename: function (req, file, cb) {
        // Extract the original file extension
        const ext = path.extname(file.originalname);
        // Append the correct extension to the filename
        // console.log("ext",ext)
        cb(null, file.fieldname + '-' + Date.now() + (ext ? ext : '.jpg'));
    }
});
const upload = multer({ storage: storage });

// Serve static files from the uploads folder
app.use('/uploads', express.static('received_images'));

// Endpoint to receive frames
app.post('/video_feed', upload.single('frame'), async(req, res) => {
    try {
        // Check if file exists
        if (!req.file) {
            return res.status(400).send({ message: 'No file received' });
        }

        // Move the file to the uploads folder
        const tempPath = req.file.path;
        // console.log("filepath",tempPath)
        const targetPath = path.join(__dirname, 'received_images', req.file.filename);
        // console.log("targetPath",targetPath)

        // Read the uploaded frame file
        const frameData = fs.readFileSync(req.file.path);
        // console.log("framedata",frameData)
        // Base64 encode the frame data
        const detector = await detectorPromise;

        const base64Frame = frameData.toString('base64');

        const img = await Jimp.read(Buffer.from(base64Frame, 'base64'));
        // console.log("base64Frame",img)
        console.log("base64Frame",img.bitmap)
        const hand = await detector.estimateHands(img.bitmap);
        console.log("hand",hand)

        fs.rename(tempPath, targetPath, (err) => {
            if (err) throw err;
            
            // console.log('File moved successfully');
            
            // Here you can process the image if needed
            // For example: Detect gesture, process, etc.

            // Send back the processed image or response
            // const detectedGesture = 'hand_raise'; // For example, replace this with your gesture detection logic
            // res.set('X-Detected-Gesture', hand); // Set detected gesture in response header
            // res.sendFile(targetPath); // Send back the processed image
            res.json({"message":hand})
        });
    } catch (error) {
        console.error('Error receiving frame:', error);
        res.status(500).send({ message: 'Error receiving frame' });
    }
});

io.on("connection", (socket) => {
    console.log("user connected")
	socket.emit("me", socket.id)

	socket.on("disconnect", () => {
        console.log("user disconnected")
		socket.broadcast.emit("callEnded")
	})

	socket.on("callUser", (data) => {
		io.to(data.userToCall).emit("callUser", { signal: data.signalData, from: data.from })
	})

	socket.on("answerCall", (data) => {
		io.to(data.to).emit("callAccepted", data.signal)
	})
})

server.listen(3005, async() =>{
            console.log("model loading...") 
            detectorPromise = await handpose.load();
            console.log("server is running on port 3005")
})






// // const express = require('express');
// // const multer = require('multer');
// // const path = require('path');
// // const fs = require('fs');

// // const app = express();
// // const port = 3001;

// // // Multer configuration
// // const storage = multer.diskStorage({
// //     destination: function (req, file, cb) {
// //         cb(null, 'received_images/')  // Destination folder
// //     },
// //     filename: function (req, file, cb) {
// //         // Extract the original file extension
// //         const ext = path.extname(file.originalname);
// //         // Append the correct extension to the filename
// //         cb(null, file.fieldname + '-' + Date.now() + (ext ? ext : '.jpg'));
// //     }
// // });

// // const upload = multer({ storage: storage });

// // // Serve static files from the uploads folder
// // app.use('/uploads', express.static('received_images'));

// // // Endpoint to receive frames
// // app.post('/video_feed', upload.single('frame'), (req, res) => {
// //     try {
// //         // Check if file exists
// //         if (!req.file) {
// //             return res.status(400).send({ message: 'No file received' });
// //         }

// //         // Move the file to the uploads folder
// //         const tempPath = req.file.path;
// //         const targetPath = path.join(__dirname, 'received_images', req.file.filename);

// //         fs.rename(tempPath, targetPath, (err) => {
// //             if (err) throw err;
            
// //             console.log('File moved successfully');
            
// //             // Here you can process the image if needed
// //             // For example: Detect gesture, process, etc.

// //             // Send back the processed image or response
// //             const detectedGesture = 'hand_raise'; // For example, replace this with your gesture detection logic
// //             res.set('X-Detected-Gesture', detectedGesture); // Set detected gesture in response header
// //             res.sendFile(targetPath); // Send back the processed image
// //         });
// //     } catch (error) {
// //         console.error('Error receiving frame:', error);
// //         res.status(500).send({ message: 'Error receiving frame' });
// //     }
// // });

// // app.listen(port, () => {
// //     console.log(`Server is running on port ${port}`);
// // });














// const express = require("express");
// const http = require("http");
// const app = express();
// const bodyParser = require("body-parser");
// const multer = require('multer');
// const path = require('path');
// const fs = require('fs');
// const cors = require("cors");
// const handTrack = require('handtrackjs');

// const server = http.createServer(app);
// const io = require("socket.io")(server, {
//     cors: {
//         origin: "http://localhost:3000",
//         methods: ["GET", "POST"]
//     }
// });

// app.use(cors());
// app.use(express.json());
// app.use(bodyParser.json());

// // Multer configuration
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, 'received_images'); // Destination folder
//     },
//     filename: function (req, file, cb) {
//         // Extract the original file extension
//         const ext = path.extname(file.originalname);
//         // Append the correct extension to the filename
//         cb(null, file.fieldname + '-' + Date.now() + (ext ? ext : '.jpg'));
//     }
// });
// const upload = multer({ storage: storage });

// // Serve static files from the uploads folder
// app.use('/uploads', express.static('received_images'));

// // Load Handtrack.js model
// let modelLoaded = false;
// const loadModel = async () => {
//     await handTrack.load().then(() => {
//         modelLoaded = true;
//         console.log('Handtrack.js model loaded');
//     });
// }
// loadModel();

// // Endpoint to receive frames
// app.post('/video_feed', upload.single('frame'), async (req, res) => {
//     try {
//         // Check if file exists
//         if (!req.file) {
//             return res.status(400).send({ message: 'No file received' });
//         }

//         // Check if Handtrack.js model is loaded
//         if (!modelLoaded) {
//             return res.status(500).send({ message: 'Handtrack.js model is not loaded yet' });
//         }

//         // Move the file to the uploads folder
//         const tempPath = req.file.path;
//         const targetPath = path.join(__dirname, 'received_images', req.file.filename);

//         // Read the uploaded frame file
//         const frameData = fs.readFileSync(tempPath);

//         // Perform hand detection using Handtrack.js
//         const img = new Image();
//         img.src = 'data:image/jpeg;base64,' + Buffer.from(frameData).toString('base64');

//         const hands = await handTrack.detect(img);
//         console.log("Hands:", hands);

//         // Rename and move the frame file
//         fs.rename(tempPath, targetPath, (err) => {
//             if (err) throw err;

//             // Send back the processed image or response
//             const detectedGesture = hands.length > 0 ? 'hand_detected' : 'no_hand_detected';
//             res.set('X-Detected-Gesture', detectedGesture);
//             res.sendFile(targetPath);
//         });
//     } catch (error) {
//         console.error('Error receiving frame:', error);
//         res.status(500).send({ message: 'Error receiving frame' });
//     }
// });

// io.on("connection", (socket) => {
//     console.log("user connected");
//     socket.emit("me", socket.id);

//     socket.on("disconnect", () => {
//         console.log("user disconnected");
//         socket.broadcast.emit("callEnded");
//     });

//     socket.on("callUser", (data) => {
//         io.to(data.userToCall).emit("callUser", { signal: data.signalData, from: data.from });
//     });

//     socket.on("answerCall", (data) => {
//         io.to(data.to).emit("callAccepted", data.signal);
//     });
// });

// server.listen(5000, () => {
//     console.log("Server is running on port 5000");
// });
