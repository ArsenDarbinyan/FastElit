import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { code, name, description } = await request.json();

    // Валидация
    if (!code || !name) {
      return NextResponse.json(
        { success: false, message: 'Код и название обязательны' },
        { status: 400 }
      );
    }

    // Отправляем в backend
    const response = await fetch('http://backend:3001/api/referral-links', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code, name, description })
    });

    const result = await response.json();

    if (response.ok) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(
        { success: false, message: result.message || 'Ошибка создания ссылки' },
        { status: response.status }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Получаем все реф ссылки из backend
    const response = await fetch('http://backend:3001/api/referral-links');
    const result = await response.json();

    if (response.ok) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(
        { success: false, message: 'Ошибка получения ссылок' },
        { status: response.status }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
