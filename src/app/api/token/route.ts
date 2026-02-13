import { NextRequest, NextResponse } from 'next/server';

interface TokenResponse {
  livekit_url: string;
  token: string;
  room_name: string;
}

interface VocalBridgeError {
  error: string;
  message?: string;
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.VOCAL_BRIDGE_API_KEY;
    const baseUrl = process.env.VOCAL_BRIDGE_URL || 'https://vocalbridgeai.com/api/v1';

    if (!apiKey) {
      return NextResponse.json(
        { error: 'VOCAL_BRIDGE_API_KEY is not configured' },
        { status: 500 }
      );
    }

    // Parse request body for participant name
    let participantName = 'User';
    try {
      const body = await request.json();
      if (body.participant_name) {
        participantName = body.participant_name;
      }
    } catch {
      // Use default participant name if body parsing fails
    }

    // Request token from Vocal Bridge API
    const response = await fetch(`${baseUrl}/token`, {
      method: 'POST',
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        participant_name: participantName,
      }),
    });

    if (!response.ok) {
      const errorData: VocalBridgeError = await response.json().catch(() => ({
        error: 'Failed to parse error response',
      }));
      
      console.error('Vocal Bridge API Error:', errorData);
      
      return NextResponse.json(
        { 
          error: 'Failed to fetch token from Vocal Bridge',
          details: errorData.message || errorData.error 
        },
        { status: response.status }
      );
    }

    const tokenData: TokenResponse = await response.json();

    return NextResponse.json(tokenData);
  } catch (error) {
    console.error('Token generation error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
