import { GoogleGenerativeAI } from '@google/generative-ai'

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || ''

const genAI = new GoogleGenerativeAI(API_KEY)

const SYSTEM_PROMPT = `You are MediMind AI, an advanced medical assistant powered by cutting-edge AI. 
You help users understand their symptoms, provide general health information, suggest when to see a doctor, 
and offer wellness advice. 

IMPORTANT GUIDELINES:
- Always remind users you are an AI and not a replacement for professional medical advice
- Be empathetic, clear, and concise
- Use bullet points and structured responses for clarity
- For emergencies, always advise to call 911 or go to the ER immediately
- Provide evidence-based information
- Keep responses focused and helpful`

export async function streamGeminiResponse(
  userMessage: string,
  onChunk: (chunk: string) => void,
  onDone: () => void,
  onError: (err: string) => void
) {
  try {
    if (!API_KEY) {
      // Demo mode - simulate streaming
      const demoResponse = getDemoResponse(userMessage)
      let i = 0
      const interval = setInterval(() => {
        if (i < demoResponse.length) {
          onChunk(demoResponse.slice(i, i + 3))
          i += 3
        } else {
          clearInterval(interval)
          onDone()
        }
      }, 20)
      return
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: SYSTEM_PROMPT,
    })

    const result = await model.generateContentStream(userMessage)

    for await (const chunk of result.stream) {
      const text = chunk.text()
      if (text) onChunk(text)
    }

    onDone()
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error occurred'
    onError(message)
    onDone()
  }
}

function getDemoResponse(input: string): string {
  const lower = input.toLowerCase()
  if (lower.includes('headache')) {
    return `## Headache Assessment 🧠\n\nI understand you're experiencing a headache. Here's what I can help with:\n\n**Possible Causes:**\n- Tension headache (most common)\n- Dehydration\n- Eye strain\n- Stress or anxiety\n- Lack of sleep\n\n**Immediate Relief Tips:**\n- Drink a full glass of water\n- Rest in a dark, quiet room\n- Apply a cold or warm compress\n- Take OTC pain relievers (ibuprofen/acetaminophen) if needed\n\n**⚠️ See a doctor if:**\n- Pain is sudden and severe ("thunderclap")\n- Accompanied by fever, stiff neck, or confusion\n- Doesn't improve with medication\n\n*I'm an AI assistant — always consult a healthcare professional for persistent symptoms.*`
  }
  if (lower.includes('fever')) {
    return `## Fever Guidance 🌡️\n\nA fever is your body's natural response to infection.\n\n**Normal vs. Concerning:**\n- 99-100.4°F: Low-grade, monitor closely\n- 100.4-103°F: Moderate, treat symptoms\n- 103°F+: High, seek medical attention\n\n**Management:**\n- Stay hydrated — drink plenty of fluids\n- Rest and avoid strenuous activity\n- Use fever reducers (acetaminophen/ibuprofen)\n- Wear light clothing\n\n**🚨 Emergency Signs:**\n- Fever above 104°F\n- Difficulty breathing\n- Severe headache or rash\n- Confusion or seizures\n\n*Please consult a doctor if fever persists beyond 2-3 days.*`
  }
  if (lower.includes('chest pain')) {
    return `## ⚠️ CHEST PAIN — URGENT NOTICE\n\n**If this is severe, sudden, or crushing chest pain — CALL 911 IMMEDIATELY.**\n\nChest pain can have many causes:\n\n**Cardiac (Emergency):**\n- Heart attack — crushing pain, radiating to arm/jaw\n- Call 911, chew aspirin if not allergic\n\n**Non-Cardiac:**\n- Acid reflux / GERD\n- Muscle strain\n- Anxiety / panic attack\n- Costochondritis\n\n**Please seek immediate medical evaluation for any chest pain.**\n\n*This is not a situation to manage at home without professional assessment.*`
  }
  return `## MediMind AI Response 🏥\n\nThank you for sharing that with me. Based on what you've described, here are my thoughts:\n\n**General Advice:**\n- Monitor your symptoms closely\n- Stay hydrated and get adequate rest\n- Maintain a healthy diet\n- Track any changes in your condition\n\n**When to Seek Care:**\n- If symptoms worsen or persist beyond 48 hours\n- If you develop additional concerning symptoms\n- If you're unsure about anything health-related\n\n**Wellness Tips:**\n- Regular exercise (30 min/day)\n- 7-9 hours of sleep\n- Balanced nutrition\n- Stress management\n\n*Remember: I'm an AI assistant and cannot replace professional medical advice. Please consult a qualified healthcare provider for proper diagnosis and treatment.*`
}
