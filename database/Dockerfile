FROM postgres:17

RUN apt-get update && apt-get install -y python3 python3-pip --no-install-recommends

RUN pip3 install --no-cache-dir \
        alembic==1.13.* \
        SQLAlchemy==2.* \
        psycopg[binary] \
        asyncpg

WORKDIR /app
