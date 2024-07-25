import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk";
import { avatarAppConfig } from "./config";
 
const cogSvcRegion = avatarAppConfig.cogSvcRegion;
const cogSvcSubKey = avatarAppConfig.cogSvcSubKey;
const voiceName = avatarAppConfig.voiceName;
const avatarCharacter = avatarAppConfig.avatarCharacter;
const avatarStyle = avatarAppConfig.avatarStyle;
const avatarBackgroundColor = "#FFFFFFFF";
 
export const createWebRTCConnection = (iceServerUrl, iceServerUsername, iceServerCredential) => {
    try {
        console.log("Creating WebRTC connection with:", iceServerUrl, iceServerUsername, iceServerCredential);
        const peerConnection = new RTCPeerConnection({
            iceServers: [{
                urls: [iceServerUrl],
                username: iceServerUsername,
                credential: iceServerCredential
            }]
        });
        return peerConnection;
    } catch (error) {
        console.error("Error creating WebRTC connection: ", error);
        throw error;
    }
};
 
export const createAvatarSynthesizer = () => {
    try {
        console.log("Initializing Speech SDK with:", cogSvcSubKey, cogSvcRegion, voiceName);
        const speechSynthesisConfig = SpeechSDK.SpeechConfig.fromSubscription(cogSvcSubKey, cogSvcRegion);
        speechSynthesisConfig.speechSynthesisVoiceName = voiceName;
 
        const videoFormat = new SpeechSDK.AvatarVideoFormat();
 
        const videoCropTopLeftX = 600;
        const videoCropBottomRightX = 1320;
        videoFormat.setCropRange(new SpeechSDK.Coordinate(videoCropTopLeftX, 50), new SpeechSDK.Coordinate(videoCropBottomRightX, 1080));
 
        console.log("Avatar configuration:", avatarCharacter, avatarStyle, avatarBackgroundColor);
        const avatarConfig = new SpeechSDK.AvatarConfig(avatarCharacter, avatarStyle, videoFormat);
        avatarConfig.backgroundColor = avatarBackgroundColor;
 
        const avatarSynthesizer = new SpeechSDK.AvatarSynthesizer(speechSynthesisConfig, avatarConfig);
 
        avatarSynthesizer.avatarEventReceived = (s, e) => {
            const offsetMessage = e.offset === 0 ? "" : `, offset from session start: ${e.offset / 10000}ms.`;
            console.log(`[${new Date().toISOString()}] Event received: ${e.description}${offsetMessage}`);
        };
 
        return avatarSynthesizer;
    } catch (error) {
        console.error("Error creating Avatar Synthesizer: ", error);
        throw error;
    }
};