import { NextRequest, NextResponse } from 'next/server';

const AI_SERVICE_URL = process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:8000';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get('location') || 'riau';
    const type = searchParams.get('type') || 'fire'; // 'fire' or 'air_quality'

    let endpoint = '';
    if (type === 'air_quality') {
      endpoint = `${AI_SERVICE_URL}/predict/air_quality/realtime/${location}`;
    } else {
      endpoint = `${AI_SERVICE_URL}/predict/realtime/${location}`;
    }

    console.log('Proxying request to:', endpoint);

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error('AI Service error:', response.status, errorText);
      return NextResponse.json(
        { error: 'AI Service error', message: errorText, status: response.status },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error: any) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      {
        error: 'Proxy error',
        message: error.message || 'Failed to fetch from AI service',
        details: 'Make sure AI service is running at ' + AI_SERVICE_URL,
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
