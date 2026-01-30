Neon (Postgres) deployment guide

1) Create a Neon project and copy the DATABASE_URL (ensure it uses `sslmode=require`).

   - Recommended project name: `chemical-equipment-visualizer` (use `-dev`/`-staging` suffixes for non-production environments).
   - Choose the region closest to your app (e.g., AWS US East 1).
   - Optionally enable "Neon Auth" for Neon-managed auth, but this project uses Django auth.

2) Add required Python packages (already in `requirements.txt`):
   - `psycopg2-binary`
   - `dj-database-url`
   - `whitenoise`
   - (optional) `django-storages[boto3]` + `boto3` for S3 media

3) Set environment variables in your host (Render/Fly/Railway/Heroku/etc) or GitHub Secrets:
   - `DATABASE_URL` (Neon connection string, e.g. `postgres://user:password@host:5432/dbname?sslmode=require`)
   - `SECRET_KEY` (use a strong random value)
   - `DEBUG=false`
   - `ALLOWED_HOSTS=example.com,your-domain`
   - (if using S3) `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_STORAGE_BUCKET_NAME`, `AWS_S3_REGION_NAME`

   > Tip: Add `DATABASE_URL` to your repository's **Settings → Secrets → Actions** (so CI can run migrations/tests against it). Only add production secrets after you verify with a test database.

4) Local testing & migration (point to Neon temporarily):
   ```bash
   # on Windows PowerShell
   $env:DATABASE_URL='postgres://user:password@host:5432/dbname?sslmode=require'
   python manage.py migrate
   python manage.py createsuperuser
   ```

   Confirm connection with:
   ```bash
   python -c "import dj_database_url, os; print(dj_database_url.parse(os.getenv('DATABASE_URL')) )"
   ```

5) Dump & restore data (optional, when migrating from SQLite):
   ```bash
   python manage.py dumpdata --natural-primary --natural-foreign --exclude auth.permission --exclude contenttypes --indent 2 > data.json
   # set DATABASE_URL to Neon
   python manage.py migrate
   python manage.py loaddata data.json
   ```

6) Collect static files & run in production:
   ```bash
   python manage.py collectstatic --noinput
   # example run command using Gunicorn
   gunicorn core.wsgi --workers 3 --bind 0.0.0.0:$PORT
   ```

7) CI: run tests and migrations in GitHub Actions (see `.github/workflows/backend-deploy.yml`).

8) Notes & best practices:
   - Neon uses serverless Postgres; avoid opening excessive concurrent connections. Use a pooler if needed and keep `conn_max_age` modest.
   - Keep `DEBUG=false` and rotate `SECRET_KEY` securely.
   - Prefer S3 for media (uploads) in production rather than local disk.
   - Monitor Neon connection usage and scale poolers/worker counts accordingly.

If you want, I can add S3 storage support and a deploy workflow that pushes the app to Render or Fly and runs migrations automatically.