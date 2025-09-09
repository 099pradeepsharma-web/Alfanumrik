import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import type { Message } from '../types';
import Spinner from './Spinner';
import { Send, X, Mic, Video, VideoOff, MicOff } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import { useLocalization } from '../hooks/useLocalization';
import { speak } from '../services/speechService';
import { LEARNING_TOPICS } from '../constants';

interface TutorChatProps {
    onClose: () => void;
}

const TutorChat: React.FC<TutorChatProps> = ({ onClose }) => {
    const { currentUser, selectedTopicId } = useAppContext();
    const { currentLang } = useLocalization();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isCameraOn, setIsCameraOn] = useState(false);

    const chatRef = useRef<Chat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const recognitionRef = useRef<any | null>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(scrollToBottom, [messages]);
    
    const stopAllStreams = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setIsCameraOn(false);
    };

    const handleSendMessage = async (e: React.FormEvent | null, textOverride?: string) => {
        e?.preventDefault();
        const messageText = textOverride || input;
        if (!messageText.trim() || isLoading || !chatRef.current) return;
    
        const userMessage: Message = { sender: 'user', text: messageText };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
    
        try {
            let response;
            // Check if camera is on and video element is ready to capture a frame
            if (isCameraOn && videoRef.current && videoRef.current.readyState >= 2) {
                const canvas = document.createElement('canvas');
                const video = videoRef.current;
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const ctx = canvas.getContext('2d');
                
                if (ctx) {
                    // Flip the canvas horizontally to match the mirrored video feed the user sees
                    ctx.translate(canvas.width, 0);
                    ctx.scale(-1, 1);
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                    
                    // Get base64 data, remove the 'data:image/jpeg;base64,' prefix
                    const base64Data = canvas.toDataURL('image/jpeg').split(',')[1];
    
                    const imagePart = {
                        inlineData: {
                            mimeType: 'image/jpeg',
                            data: base64Data,
                        },
                    };
                    const textPart = { text: messageText };
    
                    // Send message with both text and image parts
                    response = await chatRef.current.sendMessage({ message: [textPart, imagePart] });
                } else {
                    // Fallback to text-only if canvas fails
                    response = await chatRef.current.sendMessage({ message: messageText });
                }
            } else {
                // Default text-only message if camera is off or not ready
                response = await chatRef.current.sendMessage({ message: messageText });
            }
    
            const tutorMessage: Message = { sender: 'tutor', text: response.text };
            setMessages(prev => [...prev, tutorMessage]);
            if (textOverride) {
                speak(response.text, currentLang);
            }
        } catch (error) {
            console.error("Failed to send message:", error);
            const errorMessage: Message = { sender: 'tutor', text: "I'm sorry, I encountered an error. Please try asking again." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Speech Recognition Setup
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = currentLang === 'hi' ? 'hi-IN' : 'en-IN';
            
            recognition.onresult = (event: any) => {
                const transcript = event.results[event.results.length - 1][0].transcript.trim();
                if (transcript) {
                    handleSendMessage(null, transcript);
                }
            };
            
            recognition.onerror = (event: any) => {
                console.error("Speech recognition error", event.error);
                if (event.error === 'network') {
                    alert("Speech recognition failed. Please check your internet connection and try again.");
                } else if (event.error === 'no-speech') {
                    alert("I didn't hear anything. Please try speaking again.");
                } else if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
                    alert("Microphone access was denied. Please enable it in your browser settings to use voice input.");
                } else {
                    alert(`An unexpected speech recognition error occurred: ${event.error}`);
                }
                setIsListening(false);
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognitionRef.current = recognition;
        } else {
            console.warn("Speech recognition not supported in this browser.");
        }

        // Chat initialization
        if (!currentUser) return;

        const firstName = currentUser.name.split(' ')[0];
        const greetingText = `Hello ${firstName} ! I'm Alfa. How can I help you today?`;
        
        // Set initial message in the UI and speak it aloud.
        setMessages([{ sender: 'tutor', text: greetingText }]);
        speak(greetingText, currentLang);
        
        let currentTopicInfo = '';
        if (selectedTopicId && currentUser?.classLevel) {
          const subjects = LEARNING_TOPICS[currentUser.classLevel] || [];
          const allTopics = subjects.flatMap(s => s.topics.map(t => ({...t, subjectName: s.name})));
          const currentTopic = allTopics.find(t => t.id === selectedTopicId);
          if (currentTopic) {
            currentTopicInfo = `The student is currently studying the topic "${currentTopic.name}" in the subject of ${currentTopic.subjectName}. Tailor your explanations and examples to this topic if relevant to the conversation.`;
          }
        }

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
        chatRef.current = ai.chats.create({
            model: 'gemini-2.5-flash',
            history: [ // Prime the chat history with the greeting.
                { role: 'model', parts: [{ text: greetingText }] }
            ],
            config: {
                systemInstruction: `Your name is Alfa. You are a friendly, patient, and encouraging AI tutor for a K-12 student in India using the CBSE curriculum.
                The student you are tutoring is named ${currentUser.name} and is in Class ${currentUser.classLevel}. Always address them by their name.
                ${currentTopicInfo}
                Your goal is to guide the student to the correct answer, not just provide it.
                - When asked a question, break down the concept into simple, easy-to-understand steps appropriate for their class level.
                - Use real-world analogies relevant to an Indian student.
                - Use Indian English phrasing where natural and appropriate (e.g., use "lakhs" and "crores" for large numbers).
                - After explaining a concept, ask a follow-up question to check for understanding.
                - If a student is wrong, gently correct them and explain the misconception.
                - Keep your responses concise and focused.
                - You may also receive images from the student's camera along with their text. If you see an image, use it as context. For example, if they show you a math problem in their notebook, help them solve it. If they look confused, be extra encouraging. Keep your analysis of the user and their environment strictly professional and focused on educational assistance.`,
            },
        });
        
        // Cleanup function
        return () => {
            stopAllStreams();
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
        };
    }, [currentUser, currentLang, selectedTopicId]);

    const toggleCamera = async () => {
        if (isCameraOn) {
            stopAllStreams();
        } else {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
                setIsCameraOn(true);
            } catch (err) {
                console.error("Error accessing camera:", err);
                alert("Could not access the camera. Please ensure you have given the necessary permissions.");
            }
        }
    };

    const toggleListen = async () => {
        if (!recognitionRef.current) {
            alert("Speech recognition is not supported by your browser.");
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        } else {
            try {
                // Ensure mic permissions are granted before starting
                await navigator.mediaDevices.getUserMedia({ audio: true });
                recognitionRef.current.start();
                setIsListening(true);
            } catch (err) {
                console.error("Error accessing microphone:", err);
                alert("Could not access the microphone. Please ensure you have given the necessary permissions.");
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center animate-fade-in">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg h-[80vh] flex flex-col m-4 animate-slide-in-up">
                <header className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Alfa, Your AI Tutor</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-slate-400 btn-pressable" aria-label="Close chat">
                        <X className="h-6 w-6" />
                    </button>
                </header>

                <main className="flex-1 overflow-y-auto p-4 space-y-4">
                    {isCameraOn && (
                        <div className="bg-black rounded-lg mb-4">
                            <video ref={videoRef} autoPlay playsInline muted className="w-full h-auto rounded-lg aspect-video object-cover transform -scale-x-100"></video>
                        </div>
                    )}
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                            {msg.sender === 'tutor' && <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">A</div>}
                            <div className={`max-w-xs md:max-w-md p-3 rounded-2xl ${msg.sender === 'user'
                                ? 'bg-indigo-600 text-white rounded-br-none'
                                : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-none'
                                }`}>
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    {isLoading && messages.length > 0 && messages[messages.length - 1].sender === 'user' && (
                        <div className="flex items-end gap-2 justify-start">
                            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">A</div>
                             <div className="max-w-xs md:max-w-md p-3 rounded-2xl bg-slate-200 dark:bg-slate-700">
                                <Spinner text="Typing..." />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </main>

                <footer className="p-4 border-t border-slate-200 dark:border-slate-700">
                    <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={toggleListen}
                            className={`p-3 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors btn-pressable ${
                                isListening ? 'text-red-500' : 'text-slate-500'
                            }`}
                            aria-label={isListening ? 'Stop listening' : 'Start listening'}
                        >
                            {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                        </button>
                        <button
                            type="button"
                            onClick={toggleCamera}
                            className={`p-3 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors btn-pressable ${
                                isCameraOn ? 'text-indigo-500' : 'text-slate-500'
                            }`}
                             aria-label={isCameraOn ? 'Turn off camera' : 'Turn on camera'}
                        >
                            {isCameraOn ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
                        </button>
                         <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={isListening ? "Listening..." : "Ask a question..."}
                            disabled={isLoading || isListening}
                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-full bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className="p-3 bg-indigo-600 text-white rounded-full shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 btn-pressable"
                            aria-label="Send message"
                        >
                            <Send className="h-5 w-5" />
                        </button>
                    </form>
                </footer>
            </div>
        </div>
    );
};

export default TutorChat;