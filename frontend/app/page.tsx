import { getNews } from './news';
import NewsHome from './news-home';
export const dynamic = 'force-dynamic';
export default async function Home() {
  return <NewsHome {...await getNews()} />;
}
