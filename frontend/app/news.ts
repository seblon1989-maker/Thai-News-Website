import type { Article, Source } from './news-types';
export async function getNews(): Promise<{ articles: Article[]; sources: Source[]; unavailable: boolean }> {
  try {
    const response = await fetch(`${process.env.API_URL || 'http://127.0.0.1:8000'}/articles`, { cache: 'no-store', signal: AbortSignal.timeout(8000) });
    if (!response.ok) throw new Error('API nicht erreichbar');
    const data = await response.json();
    return { articles: data.articles, sources: data.sources, unavailable: false };
  } catch {
    return { articles: [], sources: [], unavailable: true };
  }
}
