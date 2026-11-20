import api from './api';

export async function sendVoiceInteract(spokenText, currentState = 'normal') {
  try {
    const response = await fetch('http://localhost:5102/api/AiCompanion/voice-interact', { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        spokenText: spokenText,
        currentState: currentState,
      }),
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}