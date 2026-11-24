// Web Speech API Assistant for DISHA

export interface SpeechResponse {
  spokenText: string;
  actionDestinationNodeId?: string;
  category: 'navigation' | 'queue' | 'facility' | 'general' | 'emergency';
}

class SpeechService {
  private recognition: any = null;
  private isListening = false;
  private synthesisVoice: SpeechSynthesisVoice | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private speechRate: number = 1.0;

  constructor() {
    this.initRecognition();
    this.initVoices();
  }

  private initRecognition() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.maxAlternatives = 1;
    }
  }

  private initVoices() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        const voices = window.speechSynthesis.getVoices();
        // Prefer Indian English or Hindi if available
        this.synthesisVoice = voices.find(v => v.lang.includes('hi') || v.lang.includes('IN') || v.lang.includes('en-IN')) || voices[0] || null;
      };
    }
  }

  public isSpeechRecognitionSupported(): boolean {
    return Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  }

  public isSpeechSynthesisSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  public setRate(rate: number) {
    this.speechRate = rate;
  }

  public startListening(
    lang: string,
    onResult: (text: string) => void,
    onError: (err: any) => void,
    onEnd: () => void
  ): boolean {
    if (!this.recognition) return false;

    // Map language code to BCP-47
    const langMap: Record<string, string> = {
      en: 'en-IN',
      hi: 'hi-IN',
      pa: 'pa-IN',
      bn: 'bn-IN',
      mr: 'mr-IN',
      ta: 'ta-IN',
      te: 'te-IN'
    };
    this.recognition.lang = langMap[lang] || 'en-IN';

    this.recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };

    this.recognition.onerror = (err: any) => {
      this.isListening = false;
      onError(err);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      onEnd();
    };

    try {
      this.recognition.start();
      this.isListening = true;
      return true;
    } catch (e) {
      return false;
    }
  }

  public stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  public speak(text: string, lang: string = 'en', onEnd?: () => void): void {
    if (!this.isSpeechSynthesisSupported()) return;

    window.speechSynthesis.cancel(); // Cancel any ongoing speech

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = this.speechRate;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const langCode = lang === 'hi' ? 'hi-IN' : lang === 'ta' ? 'ta-IN' : lang === 'te' ? 'te-IN' : lang === 'bn' ? 'bn-IN' : 'en-IN';
    const matchedVoice = voices.find(v => v.lang.startsWith(langCode.substring(0, 2)) || v.lang.includes(langCode));

    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    if (onEnd) {
      utterance.onend = () => onEnd();
      utterance.onerror = () => onEnd();
    }

    this.currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  }

  public pauseSpeaking() {
    if (this.isSpeechSynthesisSupported()) {
      window.speechSynthesis.pause();
    }
  }

  public resumeSpeaking() {
    if (this.isSpeechSynthesisSupported()) {
      window.speechSynthesis.resume();
    }
  }

  public stopSpeaking() {
    if (this.isSpeechSynthesisSupported()) {
      window.speechSynthesis.cancel();
      this.currentUtterance = null;
    }
  }

  /**
   * Rule-based intent matching for hospital voice queries
   */
  public processVoiceCommand(
    queryText: string,
    context?: { tokenNumber?: string; patientsAhead?: number; waitMinutes?: number; language?: string }
  ): SpeechResponse {
    const lower = queryText.toLowerCase();

    // 1. Pharmacy / Medicines
    if (lower.includes('pharmacy') || lower.includes('medicine') || lower.includes('dawa') || lower.includes('davai') || lower.includes('aushadhi') || lower.includes('மருந்து') || lower.includes('మందులు')) {
      return {
        spokenText: 'The Jan Aushadhi Pharmacy is located on the Ground Floor, East Wing, Room G-08. Free generic medicines are dispensed here.',
        actionDestinationNodeId: 'N-G-PHARMACY',
        category: 'navigation'
      };
    }

    // 2. Pathology Lab / Blood Test
    if (lower.includes('lab') || lower.includes('blood') || lower.includes('test') || lower.includes('pathology') || lower.includes('khoon') || lower.includes('jaanch') || lower.includes('రక్తం') || lower.includes('இரத்தம்')) {
      return {
        spokenText: 'Pathology Lab and Blood Sample Collection are on the First Floor, Block A. Take Elevator Lift A or Staircase A to the First Floor.',
        actionDestinationNodeId: 'N-1-BLOOD',
        category: 'navigation'
      };
    }

    // 3. Registration Counter
    if (lower.includes('registration') || lower.includes('counter') || lower.includes('parchi') || lower.includes('register') || lower.includes('entry') || lower.includes('रजिस्ट्रेशन')) {
      return {
        spokenText: 'The Registration Counter is on the Ground Floor, Room G-01, just to the left of the central atrium.',
        actionDestinationNodeId: 'N-G-REG',
        category: 'navigation'
      };
    }

    // 4. General OPD / Doctor Consultation
    if (lower.includes('opd') || lower.includes('doctor') || lower.includes('consultation') || lower.includes('daksaab') || lower.includes('चिकित्सक')) {
      return {
        spokenText: 'General OPD is on the Ground Floor, Room G-12. Follow the green corridor line straight from the waiting area.',
        actionDestinationNodeId: 'N-G-OPD',
        category: 'navigation'
      };
    }

    // 5. Drinking Water
    if (lower.includes('water') || lower.includes('pani') || lower.includes('drinking') || lower.includes('जल') || lower.includes('தண்ணீர்') || lower.includes('నీరు')) {
      return {
        spokenText: 'Clean drinking water is available next to the Ground Floor waiting area, approximately 30 meters straight ahead.',
        actionDestinationNodeId: 'N-G-WATER-1',
        category: 'facility'
      };
    }

    // 6. Toilets / Restroom
    if (lower.includes('toilet') || lower.includes('washroom') || lower.includes('restroom') || lower.includes('shauchalay') || lower.includes('bathroom') || lower.includes('கழிப்பறை') || lower.includes('మరుగుదొడ్డి')) {
      return {
        spokenText: 'Wheelchair-accessible toilets are located near the Registration Counter on the Ground Floor, and beside the First Floor waiting lounge.',
        actionDestinationNodeId: 'N-G-TOILET-1',
        category: 'facility'
      };
    }

    // 7. Token / Wait Time Query
    if (lower.includes('token') || lower.includes('number') || lower.includes('wait') || lower.includes('time') || lower.includes('kitna time') || lower.includes('बारी') || lower.includes('நேரம்')) {
      const tok = context?.tokenNumber || 'OPD-024';
      const ahead = context?.patientsAhead !== undefined ? context.patientsAhead : 4;
      const mins = context?.waitMinutes !== undefined ? context.waitMinutes : 16;
      return {
        spokenText: `Your queue token is ${tok}. There are currently ${ahead} patients ahead of you. Estimated waiting time is approximately ${mins} minutes.`,
        category: 'queue'
      };
    }

    // 8. Help Desk / Inquiry
    if (lower.includes('help') || lower.includes('inquiry') || lower.includes('madad') || lower.includes('sahayata') || lower.includes('உதவி')) {
      return {
        spokenText: 'The Central Help Desk is right at the Central Atrium, Room G-00. Hospital marshals and wheelchairs are stationed there.',
        actionDestinationNodeId: 'N-G-HELPDESK',
        category: 'navigation'
      };
    }

    // 9. Lift / Elevator
    if (lower.includes('lift') || lower.includes('elevator') || lower.includes('wheelchair') || lower.includes('stairs')) {
      return {
        spokenText: 'Elevator Lift A is located in the Central Hall between the waiting lounge and consultation rooms. It provides accessible access to Floors 1 and 2.',
        actionDestinationNodeId: 'N-G-LIFT-A',
        category: 'facility'
      };
    }

    // 10. Emergency
    if (lower.includes('emergency') || lower.includes('casualty') || lower.includes('serious') || lower.includes('ambulance') || lower.includes('102') || lower.includes('112')) {
      return {
        spokenText: 'The Emergency Department is located on the Ground Floor, Block C, Room G-EM. Immediate assistance is available 24x7.',
        actionDestinationNodeId: 'N-G-EMERGENCY',
        category: 'emergency'
      };
    }

    // Default Fallback
    return {
      spokenText: "I am DISHA, your hospital assistant. You can ask me for directions to the pharmacy, lab, doctor OPD, drinking water, or ask about your token and waiting time.",
      category: 'general'
    };
  }
}

export const speechService = new SpeechService();
