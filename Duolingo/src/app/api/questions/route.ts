import { NextRequest, NextResponse } from 'next/server';
import { initDB, Question as QuestionModel } from '@/db';
import { questionsData } from '@/data/questions';
import { CategoryId, Question } from '@/types/game';

export async function GET(request: NextRequest) {
  try {
    await initDB();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') as CategoryId | null;

    // initDB ensures questions are populated

    if (category) {
      if (!questionsData[category]) {
        return NextResponse.json(
          { error: `Categoría inválida: ${category}` },
          { status: 400 }
        );
      }

      // Fetch from DB or fallback
      const dbQuestions = await QuestionModel.findAll({
        where: { categoryId: category },
        order: [['createdAt', 'ASC']],
      });

      if (dbQuestions && dbQuestions.length > 0) {
        const mapped: Question[] = dbQuestions.map((q) => ({
          id: q.id,
          categoryId: q.categoryId,
          prompt: q.prompt,
          options: (typeof q.options === 'string' ? JSON.parse(q.options) : q.options) as [string, string, string, string],
          correctIndex: q.correctIndex,
          explanation: q.explanation,
        }));
        return NextResponse.json({ questions: mapped });
      }

      return NextResponse.json({ questions: questionsData[category] });
    }

    // Return all questions grouped by category
    return NextResponse.json({ questions: questionsData });
  } catch (error: unknown) {
    console.error('Error en /api/questions:', error);
    return NextResponse.json(
      { error: 'Error interno al cargar preguntas' },
      { status: 500 }
    );
  }
}
