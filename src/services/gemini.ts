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
      onError('No API key found. Please add VITE_GEMINI_API_KEY to your .env file. Get a free key at https://aistudio.google.com/app/apikey')
      onDone()
      return
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
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

    if (message.includes('429') || message.toLowerCase().includes('quota')) {
      const retryMatch = message.match(/retry in (\d+)/)
      const secs = retryMatch ? retryMatch[1] : '60'
      onError(`⏳ Rate limit reached — please wait **${secs} seconds** and try again.\n\nThe free tier has limited requests per minute. You can upgrade at https://ai.google.dev/pricing`)
    } else {
      onError(message)
    }

    onDone()
  }
}
