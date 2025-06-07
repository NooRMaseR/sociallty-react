FROM python:3.13-slim-bookworm

COPY --from=ghcr.io/astral-sh/uv:0.4.29 /uv /uvx /bin/

WORKDIR /code

ENV PYTHONBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

COPY pyproject.toml pyproject.toml

RUN apt-get update && apt-get install -y libmagic1 && apt-get clean
RUN uv sync --group production --no-dev

COPY . .

EXPOSE 8000

CMD uv run --no-dev manage.py collectstatic --noinput && uv run --no-dev daphne sociallty.asgi:application -b 0.0.0.0 -p 8000
