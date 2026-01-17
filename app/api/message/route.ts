import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    try {
        const { message } = await req.json()

        if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 })
        }

        const webhookUrl = process.env.DISCORD_WEBHOOK_URL

        if (!webhookUrl) {
            console.error('DISCORD_WEBHOOK_URL is not defined')
            // Simulate success in development if not configured, to avoid breaking the experience
            if (process.env.NODE_ENV === 'development') {
                await new Promise(resolve => setTimeout(resolve, 1000)) // Fake delay
                return NextResponse.json({ success: true, warning: 'Webhook not configured' })
            }
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
        }

        // Send to Discord
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                content: `🌠 **New Message from the Universe**\n\n"${message}"`,
                username: "Tsumu's Universe",
                avatar_url: "https://cdn-icons-png.flaticon.com/512/3112/3112946.png" // Optional star icon
            }),
        })

        if (!response.ok) {
            throw new Error(`Discord API error: ${response.status}`)
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Failed to send message:', error)
        return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
    }
}
