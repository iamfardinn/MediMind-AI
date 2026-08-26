import OpenAI from 'openai'
import { GoogleGenerativeAI } from '@google/generative-ai'

const GITHUB_TOKEN = (import.meta.env.VITE_GITHUB_TOKEN || '').trim()
const GEMINI_API_KEY = (import.meta.env.VITE_GEMINI_API_KEY || '').trim()
const OPENAI_API_KEY = (import.meta.env.VITE_OPENAI_API_KEY || '').trim()

const SYSTEM_PROMPT = `You are MediMind AI, an advanced medical assistant.
You help users understand their symptoms, provide general health information, suggest when to see a doctor, and offer wellness advice.

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
  // 1. Try Google Gemini if key is provided
  if (GEMINI_API_KEY) {
    try {
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
      let model
      try {
        model = genAI.getGenerativeModel({
          model: 'gemini-3.6-flash',
          systemInstruction: SYSTEM_PROMPT,
        })
      } catch {
        model = genAI.getGenerativeModel({
          model: 'gemini-3.5-flash-lite',
          systemInstruction: SYSTEM_PROMPT,
        })
      }
      const result = await model.generateContentStream(userMessage)
      for await (const chunk of result.stream) {
        const text = chunk.text()
        if (text) onChunk(text)
      }
      onDone()
      return
    } catch (geminiErr: unknown) {
      console.warn('Gemini stream failed, trying fallback:', geminiErr)
    }
  }

  // 2. Try OpenAI API if key is provided
  if (OPENAI_API_KEY) {
    try {
      const openai = new OpenAI({
        apiKey: OPENAI_API_KEY,
        dangerouslyAllowBrowser: true,
      })
      const stream = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userMessage },
        ],
        stream: true,
      })
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content ?? ''
        if (text) onChunk(text)
      }
      onDone()
      return
    } catch (openaiErr: unknown) {
      console.warn('OpenAI stream failed, trying fallback:', openaiErr)
    }
  }

  // 3. Try GitHub Models
  if (GITHUB_TOKEN) {
    try {
      const client = new OpenAI({
        baseURL: 'https://models.inference.ai.azure.com',
        apiKey: GITHUB_TOKEN,
        dangerouslyAllowBrowser: true,
      })
      const stream = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userMessage },
        ],
        stream: true,
      })

      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content ?? ''
        if (text) onChunk(text)
      }

      onDone()
      return
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred'
      if (message.includes('401') || message.toLowerCase().includes('unauthorized')) {
        onError('GitHub Token is invalid or expired. You can add a free Google Gemini API key (VITE_GEMINI_API_KEY) from https://aistudio.google.com/app/apikey')
      } else if (message.includes('429') || message.toLowerCase().includes('rate limit')) {
        onError('Rate limit reached. Please wait a moment and try again.')
      } else {
        onError(message)
      }
      onDone()
      return
    }
  }

  // If no keys configured at all
  onError('No AI API key found. Please add VITE_GEMINI_API_KEY (free at https://aistudio.google.com/app/apikey) or VITE_GITHUB_TOKEN in your .env.local file and on Netlify.')
  onDone()
}
