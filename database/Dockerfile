FROM postgres:17

RUN apt-get update \
 && apt-get install -y --no-install-recommends \
        python3 python3-venv python3-pip \
 && rm -rf /var/lib/apt/lists/*

ENV VIRTUAL_ENV=/venv
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

RUN python3 -m venv $VIRTUAL_ENV \
 && pip install --upgrade pip \
 && pip install \
        alembic==1.13.* \
        "SQLAlchemy==2.*" \
        "psycopg[binary]" \
        asyncpg \
 && pip cache purge
