# #!/usr/bin/env bash
# # docker-entrypoint-initdb.d/init-passwords.sh
# set -euo pipefail
#
# : "${POSTGRES_PWD:?Need env var}"
# : "${POSTGRES_ADMIN_PWD_HASH:?Need Argon2 hash}"
# : "${POSTGRES_ADMIN_EMAIL:=admin@example.com}"
#
# psql_exec() {
#   psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" "$@"
# }
#
# if [ -z "$(ls -A /var/lib/postgresql/data)" ]; then
#   echo "First run – configuring cluster"
#
#   # 1. Роли и БД
#   psql_exec <<-EOSQL
#     ALTER ROLE postgres WITH PASSWORD '${POSTGRES_PWD}';
#     CREATE ROLE ${POSTGRES_USER} WITH LOGIN PASSWORD '${POSTGRES_PWD}';
#     CREATE DATABASE ${POSTGRES_DB} OWNER ${POSTGRES_USER};
# EOSQL
#
#   # 2. Расширения (если их не было)
#   psql_exec <<-EOSQL
#     CREATE EXTENSION IF NOT EXISTS pgcrypto;
#     CREATE EXTENSION IF NOT EXISTS citext;
# EOSQL
#
#   # 3. Миграции
#   echo "Running Alembic migrations"
#   alembic -c /app/alembic.ini upgrade head   # контейнер с alembic смонтирован в /app
#
#   # 4. Стартовый админ
#   psql_exec <<-EOSQL
#     INSERT INTO admin (email, hashed_password)
#     VALUES ('${POSTGRES_ADMIN_EMAIL}', '${POSTGRES_ADMIN_PWD_HASH}')
#     ON CONFLICT (email) DO NOTHING;
# EOSQL
#
#   echo "Init finished"
# else
#   echo "Data directory exists – skipping init"
# fi
