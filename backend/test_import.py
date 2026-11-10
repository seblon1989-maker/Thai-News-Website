"""Run only with a dedicated TEST_DATABASE_URL; never touches the live database."""
import os
import unittest

import app


class ParserTests(unittest.TestCase):
    def test_only_safe_provider_links(self):
        self.assertIsNone(app.canonical_url('javascript:alert(1)', app.SOURCES[0][2]))
        self.assertIsNone(app.canonical_url('https://127.0.0.1/private', app.SOURCES[0][2]))
        self.assertIsNone(app.canonical_url('https://www.matichon.co.th.evil.test/x', app.SOURCES[0][2]))
        self.assertEqual(app.canonical_url('https://www.matichon.co.th/x#part', app.SOURCES[0][2]), 'https://www.matichon.co.th/x')

    def test_reject_html(self):
        with self.assertRaises(ValueError):
            list(app.parse_entries(b'<html>not a feed</html>', {'feed_url': app.SOURCES[0][2]}))


@unittest.skipUnless(os.environ.get('TEST_DATABASE_URL'), 'Dedicated PostgreSQL test database required')
class DatabaseImportTests(unittest.TestCase):
    def setUp(self):
        self.original_url = os.environ['DATABASE_URL']
        os.environ['DATABASE_URL'] = os.environ['TEST_DATABASE_URL']
        self.assertNotEqual(self.original_url, os.environ['DATABASE_URL'])
        app.initialize()
        with app.connect() as db:
            db.execute('TRUNCATE articles, import_runs RESTART IDENTITY')

    def tearDown(self):
        os.environ['DATABASE_URL'] = self.original_url

    @staticmethod
    def fixture(source):
        domain = source['feed_url'].split('/')[2]
        return f'''<?xml version="1.0"?><rss version="2.0"><channel><title>Own test fixture</title><link>https://{domain}/</link><description>Test</description><item><guid>own-test-1</guid><title>Own test headline</title><link>https://{domain}/politics/test</link><pubDate>Mon, 09 Nov 2026 10:00:00 +0700</pubDate><description>Must not be stored</description></item></channel></rss>'''.encode()

    def test_import_dedup_metadata_and_dates(self):
        first = app.import_all(self.fixture)
        self.assertEqual(sum(r['added'] for r in first), 2)
        second = app.import_all(self.fixture)
        self.assertEqual(sum(r['added'] for r in second), 0)
        with app.connect() as db:
            rows = db.execute('SELECT * FROM articles').fetchall()
            self.assertEqual(len(rows), 2)
            self.assertTrue(all(r['original_description'] is None and r['image_url'] is None for r in rows))
            self.assertTrue(all(r['category'] == 'Politik' for r in rows))
            self.assertTrue(all(r['published_at'].hour == 3 for r in rows))

    def test_failed_source_does_not_stop_next(self):
        def fetch(source):
            if source['id'] == 'bangkok-post':
                raise TimeoutError('Test timeout')
            return self.fixture(source)
        result = app.import_all(fetch)
        self.assertEqual([r['status'] for r in result], ['error', 'success'])
        with app.connect() as db:
            self.assertEqual(db.execute('SELECT count(*) AS n FROM articles').fetchone()['n'], 1)
            self.assertEqual(db.execute("SELECT count(*) AS n FROM import_runs WHERE status='error'").fetchone()['n'], 1)


if __name__ == '__main__':
    unittest.main()
