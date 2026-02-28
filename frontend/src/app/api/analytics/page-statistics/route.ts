import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Получаем статистику из backend
    const response = await fetch('http://backend:3001/analytics/page-statistics');
    const result = await response.json();

    if (response.ok) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(
        { success: false, message: 'Ошибка получения статистики' },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('Page statistics API error:', error);
    return NextResponse.json(
      { success: false, message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
