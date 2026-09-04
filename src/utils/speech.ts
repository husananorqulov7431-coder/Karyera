// Web Speech API Voice Narrator for Accessibility (Ko‘zi ojizlar va ovozli hamrohlik)
// 100% client-side, works on Chrome, Safari, Android, Edge, and iOS

let isVoiceEnabled = true; // Enabled by default for accessibility
let currentUtterance: SpeechSynthesisUtterance | null = null;

// Try to find a suitable voice (Uzbek if available, otherwise Turkish, Russian, or English)
function getBestVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  // 1. Uzbek if available
  const uzVoice = voices.find(v => v.lang.startsWith('uz'));
  if (uzVoice) return uzVoice;

  // 2. Turkish (very close phonetics to Uzbek)
  const trVoice = voices.find(v => v.lang.startsWith('tr'));
  if (trVoice) return trVoice;

  // 3. Russian
  const ruVoice = voices.find(v => v.lang.startsWith('ru'));
  if (ruVoice) return ruVoice;

  // 4. Default / English
  return voices.find(v => v.default) || voices[0];
}

export function isSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function isVoiceNarrationEnabled(): boolean {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('fut_voice_narration');
    if (saved !== null) return saved === 'true';
  }
  return isVoiceEnabled;
}

export function setVoiceNarration(enabled: boolean): boolean {
  isVoiceEnabled = enabled;
  if (typeof window !== 'undefined') {
    localStorage.setItem('fut_voice_narration', enabled ? 'true' : 'false');
    if (!enabled && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
  return isVoiceEnabled;
}

export function toggleVoiceNarration(): boolean {
  const current = isVoiceNarrationEnabled();
  return setVoiceNarration(!current);
}

export function speakText(text: string, priority = false): void {
  if (!isVoiceNarrationEnabled() || !isSpeechSupported()) return;

  try {
    const synth = window.speechSynthesis;
    if (priority) {
      synth.cancel();
    }

    // Clean text of emojis for cleaner TTS pronunciation if needed
    const cleanText = text
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
      .replace(/OVR/gi, 'reyting')
      .replace(/x\b/gi, ' karra ')
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const voice = getBestVoice();
    if (voice) {
      utterance.voice = voice;
    }
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    currentUtterance = utterance;
    synth.speak(utterance);
  } catch (e) {
    console.warn('Speech synthesis error:', e);
  }
}

// Pre-load voices on first interaction
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    // voices loaded
  };
}
