Pipeline
Собираем все

```
docker compose up
```

Делаем миграцию в бд

```
docker compose exec backend bash
```

2.1 Если нужно создать миграцию

```
uv run alembic revision --autogenerate -m "initial"
```

Добавить в получившийся файл

```
    op.execute("CREATE EXTENSION IF NOT EXISTS citext")
    op.execute("CREATE EXTENSION IF NOT EXISTS pgcrypto")
```

```
uv run alembic upgrade head
```

Чекаем структуру бд

```
docker compose exec postgres psql -U app_user -d app_db
```

```

SELECT table_schema, table_name
FROM information_schema.tables
WHERE table_type='BASE TABLE'
  AND table_schema NOT IN ('pg_catalog','information_schema');
```

Создаем админа

```
docker compose exec backend bash
```

```
uv run create_admin.py
```
