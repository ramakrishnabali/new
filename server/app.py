from flask import Flask, render_template, request,jsonify
import cv2
import numpy as np
from flask_cors import CORS
import mediapipe as mp

# app = Flask(__name__)
app = Flask(__name__, static_url_path='/static')
CORS(app)

mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils

mp_face_detection = mp.solutions.face_detection
mp_drawing = mp.solutions.drawing_utils

class GestureDetector:
    def __init__(self):
        self.hands = mp_hands.Hands(static_image_mode=False, max_num_hands=1, min_detection_confidence=0.5, min_tracking_confidence=0.5)
        self.last_gesture = None

    def detect_hands(self, frame):
        imgRGB = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self.hands.process(imgRGB)
        annotated_image = frame

        # Reset last_gesture if no hands are detected in the current frame
        if not results.multi_hand_landmarks:
            self.last_gesture = None
            return annotated_image, self.last_gesture

        for hand_landmarks in results.multi_hand_landmarks:
            mp_drawing.draw_landmarks(annotated_image, hand_landmarks, mp_hands.HAND_CONNECTIONS)
            hand_data = self.get_hand_data(hand_landmarks)

            if self.detect_hand_raise(hand_data):
                self.last_gesture = 'hand_raise'
                cv2.putText(annotated_image, "Hand Raise Detected", (20, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
            elif self.detect_thumbs_up(hand_data):
                self.last_gesture = 'thumbs_up'

        return annotated_image, self.last_gesture


    def get_hand_data(self, hand_landmarks):
        hand_data = {
            'thumb_tip': hand_landmarks.landmark[4],
            'index_tip': hand_landmarks.landmark[8],
            'middle_tip': hand_landmarks.landmark[12],
            'ring_tip': hand_landmarks.landmark[16],
            'pinky_tip': hand_landmarks.landmark[20]
        }
        return hand_data

    def detect_hand_raise(self, hand_data):
        thumb_tip_y = hand_data['thumb_tip'].y
        pinky_tip_y = hand_data['pinky_tip'].y
        return thumb_tip_y > pinky_tip_y

    def detect_thumbs_up(self, hand_data):
        thumb_tip_x = hand_data['thumb_tip'].x
        thumb_tip_y = hand_data['thumb_tip'].y
        index_tip_y = hand_data['index_tip'].y
        return thumb_tip_y < index_tip_y and thumb_tip_x > hand_data['index_tip'].x

detector = GestureDetector()


def detect_faces(frame):
    with mp_face_detection.FaceDetection(min_detection_confidence=0.5) as face_detection:
        # Convert the image to RGB
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        
        # Process the image and get face detections
        results = face_detection.process(frame_rgb)
        
        # If there are detections, draw bounding boxes around the faces
        if results.detections:
            for detection in results.detections:
                mp_drawing.draw_detection(frame, detection)
            return True
        else:
            return False
# @app.route('/')
# def index():
#     return render_template('index.html')

@app.route('/video_feed', methods=['POST'])
def video_feed():
    try:
        # Receive binary image data from client
        frame_data = request.files['frame'].read()

        # Decode the image
        nparr = np.frombuffer(frame_data, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        # Check if the frame is empty
        if frame is None:
            return "Empty frame received", 400

        # Process the frame and detect hands
        annotated_frame, gesture = detector.detect_hands(frame)

        print("tgdffsccdsgdfv",gesture)
       

        # Convert annotated frame to JPEG
        _, buffer = cv2.imencode('.jpg', annotated_frame)
        frame_data = buffer.tobytes()

        # Set the detected gesture as a response header
        # response = app.response_class(
        #     response=frame_data,
        #     status=200,
        #     mimetype='image/jpeg'
        # )

        print("====================",gesture)

                # If the last detected gesture is not hand_raise or thumbs_up, set gesture to null
        if gesture not in ['hand_raise', 'thumbs_up']:
            gesture = None

        # response.headers['X-Detected-Gesture'] = gesture

        # Return the response
        return jsonify({'detected_gestures': gesture})
    
    except Exception as e:
        print("Error:", e)
        return "Error processing frame", 500

@app.route("/find_face",methods=["POST"])
def find_face():
            # Receive binary image data from client
    frame_data = request.files['frame'].read()

            # Decode the image
    nparr = np.frombuffer(frame_data, np.uint8)
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

            # Check if the frame is empty
    if frame is None:
        return "Empty frame received", 400

            # Process the frame and detect hands
    face_detected = detect_faces(frame)
        
        # Return response to the client indicating whether a face is detected
    if face_detected:
        return jsonify({'message': 'Face detected'})
    else:
        return jsonify({'message': 'No face detected'})
        
if __name__ == "__main__":
    app.run(debug=True)
