import "./Avatar.css";
import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk";
import { createAvatarSynthesizer, createWebRTCConnection } from "./Utility";
import { avatarAppConfig } from "./config";
import { useState, useRef, useEffect } from "react";
import axios from "axios";

export const Avatar = () => {
    const [avatarSynthesizer, setAvatarSynthesizer] = useState(null);
    const myAvatarVideoEleRef = useRef();
    const myAvatarAudioEleRef = useRef();
    const [mySpeechText, setMySpeechText] = useState("");
    const [isListening, setIsListening] = useState(false);
    const [chatHistory, setChatHistory] = useState([]);
    const [sessionActive, setSessionActive] = useState(false);
    const recognitionRef = useRef(null);

    const [aadharNumber, setAadharNumber] = useState("");
    const [otp, setOtp] = useState("");
    
    const iceUrl = avatarAppConfig.iceUrl;
    const iceUsername = avatarAppConfig.iceUsername;
    const iceCredential = avatarAppConfig.iceCredential;

    useEffect(() => {
        startSession();
        return () => stopSession();
    }, []);

    const handleSpeechText = (event) => {
        setMySpeechText(event.target.value);
    };

    const handleOnTrack = (event) => {
        if (event.track.kind === 'video') {
            const mediaPlayer = myAvatarVideoEleRef.current;
            mediaPlayer.id = event.track.kind;
            mediaPlayer.srcObject = event.streams[0];
            mediaPlayer.autoplay = true;
            mediaPlayer.playsInline = true;
        } else if (event.track.kind === 'audio') {
            const audioPlayer = myAvatarAudioEleRef.current;
            audioPlayer.srcObject = event.streams[0];
            audioPlayer.autoplay = true;
            audioPlayer.playsInline = true;
            audioPlayer.muted = false;
        }
    };

    const stopSession = () => {
        if (avatarSynthesizer) {
            try {
                avatarSynthesizer.stopSpeakingAsync().then(() => {
                    console.log("[" + (new Date()).toISOString() + "] Stop speaking request sent.");
                    avatarSynthesizer.close();
                }).catch((error) => {
                    console.error("Error stopping session: ", error);
                });
            } catch (e) {
                console.error("Error stopping session: ", e);
            }
        }
        setSessionActive(false);
        setChatHistory([]);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if (sessionActive) {
            sendMessageToBackend(mySpeechText, aadharNumber, otp);
        } else {
            console.log("Session is not active.");
        }
    };

    const sendMessageToBackend = async (userMessage, aadharNumber = "", otp = "") => {
        console.log("Sending to backend:", { userMessage, aadharNumber, otp });
        try {
            const messagePayload = {
                messages: [
                    {
                        role: "user",
                        content: userMessage
                    }
                ],
                aadharNumber: aadharNumber, // Include aadharNumber
                otp: otp // Include OTP
            };
    
            const response = await axios.post('https://aiavatarte.azurewebsites.net/getAssistantResponse/chats', messagePayload);
            const { response: reply, functionArgs } = response.data;
    
            if (reply && typeof reply === 'string') {
                if (reply.includes("Aadhar card number")) {
                    setAadharNumber(userMessage); // Save the Aadhar number
                    setOtp(""); // Clear the OTP
                } else if (reply.includes("OTP")) {
                    setOtp(userMessage); // Save the OTP
                }
    
                setChatHistory([...chatHistory, { role: "user", content: userMessage }, { role: "assistant", content: reply }]);
    
                // Make the avatar speak the assistant's response
                if (avatarSynthesizer) {
                    avatarSynthesizer.speakTextAsync(reply, result => {
                        if (result.reason === SpeechSDK.ResultReason.SynthesizingAudioCompleted) {
                            console.log("Speech synthesis succeeded.");
                        } else {
                            console.error("Speech synthesis failed: ", result.errorDetails);
                        }
                    });
                }
            } else {
                console.warn("Unexpected reply format:", reply);
                setChatHistory([...chatHistory, { role: "user", content: userMessage }, { role: "assistant", content: "Sorry, I didn't understand that." }]);
            }
    
            if (functionArgs) {
                console.log('Function arguments:', functionArgs);
                // Process functionArgs if necessary
            }
        } catch (error) {
            console.error("Error sending message to backend:", error);
            setChatHistory([...chatHistory, { role: "user", content: userMessage }, { role: "assistant", content: "There was an error communicating with the backend." }]);
        }
    };
    
    const handleUserInput = (input) => {
        // Handle user input
        sendMessageToBackend(input, aadharNumber, otp);
    };
    
    const updateChatHistory = (userMessage, reply) => {
        setChatHistory(prevHistory => [...prevHistory, { userMessage, reply }]);
    };

    const speakText = (textToSpeak) => {
        const audioPlayer = myAvatarAudioEleRef.current;
        audioPlayer.muted = false;

        if (avatarSynthesizer) {
            avatarSynthesizer.speakTextAsync(textToSpeak).then(
                (result) => {
                    if (result.reason === SpeechSDK.ResultReason.SynthesizingAudioCompleted) {
                        console.log("Speech and avatar synthesized to video stream.");
                    } else {
                        console.log("Unable to speak. Result ID: " + result.resultId);
                        if (result.reason === SpeechSDK.ResultReason.Canceled) {
                            let cancellationDetails = SpeechSDK.CancellationDetails.fromResult(result);
                            console.log(cancellationDetails.reason);
                            if (cancellationDetails.reason === SpeechSDK.CancellationReason.Error) {
                                console.log(cancellationDetails.errorDetails);
                            }
                        }
                    }
                }).catch((error) => {
                console.error("Error speaking text: ", error);
                avatarSynthesizer.close();
            });

            setMySpeechText("");
        } else {
            console.error("Avatar synthesizer is not initialized.");
        }
    };

    const startSession = () => {
        console.log("Starting WebRTC session...");

        let peerConnection = createWebRTCConnection(iceUrl, iceUsername, iceCredential);
        peerConnection.ontrack = handleOnTrack;
        peerConnection.addTransceiver('video', { direction: 'sendrecv' });
        peerConnection.addTransceiver('audio', { direction: 'sendrecv' });

        console.log("WebRTC connection created.");

        let synthesizer = createAvatarSynthesizer();
        setAvatarSynthesizer(synthesizer);

        peerConnection.oniceconnectionstatechange = e => {
            console.log("WebRTC status: " + peerConnection.iceConnectionState);

            if (peerConnection.iceConnectionState === 'connected') {
                console.log("Connected to Azure Avatar service");
            } else if (peerConnection.iceConnectionState === 'disconnected' || peerConnection.iceConnectionState === 'failed') {
                console.log("Azure Avatar service Disconnected");
            }
        };

        synthesizer.startAvatarAsync(peerConnection).then((r) => {
            console.log("[" + (new Date()).toISOString() + "] Avatar started.");
            setSessionActive(true);
        }).catch(
            (error) => {
                console.error("[" + (new Date()).toISOString() + "] Avatar failed to start. Error: " + error);
            }
        );
    };

    const startListening = () => {
        if (!recognitionRef.current) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (!SpeechRecognition) {
                alert("Speech recognition is not supported in this browser.");
                return;
            }

            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.lang = "en-US";
            recognitionRef.current.interimResults = false;
            recognitionRef.current.continuous = false;

            recognitionRef.current.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                console.log("Transcript:", transcript);
                sendMessageToBackend(transcript);
            };

            recognitionRef.current.onerror = (event) => {
                console.error("Speech recognition error:", event.error);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
                console.log("Speech recognition ended.");
            };

            console.log("SpeechRecognition instance created.");
        }

        if (isListening) {
            recognitionRef.current.stop();
            console.log("Stopping Speech Recognition...");
        } else {
            try {
                recognitionRef.current.start();
                setIsListening(true);
                console.log("Starting Speech Recognition...");
            } catch (error) {
                console.error("Error starting Speech Recognition:", error);
            }
        }
    };

    return (
        <div className="avatar-container">
            <div className="header">
                <h1>Techenhance AI Assistant Avatar</h1>
            </div>
            <div className="content">
                <div className="video-section">
                    <video ref={myAvatarVideoEleRef} className="avatar-video" autoPlay></video>
                    <audio ref={myAvatarAudioEleRef} className="avatar-audio" autoPlay></audio>
                </div>
                <div className="chat-section">
                    <div className="chatHistory">
                        <h3>Chat History</h3>
                        <ul>
                            {chatHistory.map((entry, index) => (
                                <li key={index}>
                                    <strong>User:</strong> {entry.content}
                                    <br />
                                    <strong>Assistant:</strong> {entry.reply}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="userInput">
                        <input type="text" value={mySpeechText} onChange={handleSpeechText} placeholder="Type your message here..." />
                        <button onClick={handleSubmit}>Send</button>
                        <button onClick={startListening}>{isListening ? "Stop Listening" : "Speak"}</button>
                    </div>
                    <div className="aadharInput">
                        <input
                            type="text"
                            value={aadharNumber}
                            onChange={(e) => setAadharNumber(e.target.value)}
                            placeholder="Enter Aadhar Number"
                        />
                        <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            placeholder="Enter OTP"
                        />
                    </div>
                </div>
            </div>
            <div className="footer">
                <button onClick={startSession}>Start Session</button>
                <button onClick={stopSession}>Stop Session</button>
            </div>
        </div>
    );
};
