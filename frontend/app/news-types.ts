export type Article = { id: number; title: string; original_url: string; language: string; published_at: string | null; imported_at: string; category: string; source: string; source_id: string };
export type Source = { id: string; name: string; last_success: string | null; last_error: string | null };
