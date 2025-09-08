import { Language } from '../types';

// A map from our app's language codes to the BCP 47 language codes used by the Web Speech API.
const langCodeMap: { [key in Language]: string } = {
    en: 'en-IN',
    hi: 'hi-IN',
};

/**
 * Uses the browser's Web Speech API to speak a given text aloud.
 * It cancels any previously queued speech to ensure messages don't overlap.
 * @param text The text to be spoken.
 * @param lang The language code ('en' or 'hi') for the speech synthesis.
 */
export const speak = (text: string, lang: Language = 'en') => {
  if ('speechSynthesis' in window) {
    // A small delay can help ensure voices are loaded, especially on the first run.
    setTimeout(() => {
        // Cancel any ongoing speech to prevent overlapping messages.
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = langCodeMap[lang] || 'en-IN'; // Fallback to Indian English
        
        // Attempt to find a matching voice for better quality.
        const voices = window.speechSynthesis.getVoices();
        const voice = voices.find(v => v.lang === utterance.lang);
        if (voice) {
            utterance.voice = voice;
        }

        window.speechSynthesis.speak(utterance);
    }, 100); // 100ms delay
  } else {
    console.warn("Text-to-speech is not supported in this browser.");
  }
};
