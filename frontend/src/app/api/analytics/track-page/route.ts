import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { pagePath, pageUrl } = await request.json();
    
    console.log('📊 Track page API called:', { pagePath, pageUrl });

    if (!pagePath) {
      return NextResponse.json(
        { success: false, message: 'pagePath обязателен' },
        { status: 400 }
      );
    }

    console.log('🔗 Sending to backend:', 'http://backend:3001/analytics/track-page');

    // Отправляем в backend analytics service
    const response = await fetch('http://backend:3001/analytics/track-page', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Forwarded-For': request.headers.get('x-forwarded-for') || '',
        'User-Agent': request.headers.get('user-agent') || '',
        'Referer': request.headers.get('referer') || '',
      },
      body: JSON.stringify({ pagePath, pageUrl })
    });

    console.log('📡 Backend response status:', response.status);

    const result = await response.json();
    console.log('📦 Backend response:', result);

    if (response.ok) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(
        { success: false, message: result.message || 'Ошибка отслеживания страницы' },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('❌ Track page API error:', error);
    return NextResponse.json(
      { success: false, message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
