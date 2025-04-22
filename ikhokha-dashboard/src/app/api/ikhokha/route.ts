import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function GET(req: NextRequest) {
  const appId = process.env.IKHOKHA_APP_ID
  const appSecret = process.env.IKHOKHA_APP_SECRET

  if (!appId || !appSecret) {
    return NextResponse.json({ error: 'Missing credentials' }, { status: 500 })
  }

  const startDate = '2024-01-01'
  const endDate = '2025-12-31'

  const requestPath = `/v1/api/payments/history?startDate=${startDate}&endDate=${endDate}`
  const fullUrl = `https://api.ikhokha.com/public-api${requestPath}`

  const signature = crypto.createHmac('sha256', appSecret)
    .update(requestPath)
    .digest('hex')

  try {
    const response = await fetch(fullUrl, {
      headers: {
        'IK-APPID': appId,
        'IK-SIGN': signature,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        {
          error: 'Failed to fetch',
          detail: errorText,
          status: response.status,
          signatureUsed: signature,
          urlCalled: fullUrl,
          pathUsedInSignature: requestPath,
        },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: 'Server error', detail: String(err) }, { status: 500 })
  }
}
