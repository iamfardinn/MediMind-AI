import OpenAI from 'openai'

const TOKEN = import.meta.env.VITE_GITHUB_TOKEN || ''

const client = new OpenAI({
  baseURL: 'https://models.inference.ai.azure.com',
  apiKey: TOKEN,
  dangerouslyAllowBrowser: true,
})

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
  try {
    if (!TOKEN) {
      onError('No GitHub token found. Please add VITE_GITHUB_TOKEN to your .env file.\n\nGet a free token at https://github.com/settings/tokens — needs no special scopes for Copilot models.')
      onDone()
      return
    }

    const stream = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user',   content: userMessage },
      ],
      stream: true,
    })

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content ?? ''
      if (text) onChunk(text)
    }

    onDone()
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error occurred'

    if (message.includes('401') || message.toLowerCase().includes('unauthorized')) {
      onError('Invalid or expired GitHub token. Please check your VITE_GITHUB_TOKEN in the .env file.')
    } else if (message.includes('429') || message.toLowerCase().includes('rate limit')) {
      onError('Rate limit reached. Please wait a moment and try again.')
    } else {
      onError(message)
    }

    onDone()
  }
}
