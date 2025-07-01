FROM python:3.13-slim-bookworm

WORKDIR /app

ENV PYTHONBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

COPY requirements.txt requirements.txt

RUN apt-get update \
	&& apt-get install -y --no-install-recommends libmagic1 \
	&& apt-get upgrade -y \
	&& apt-get clean \
	&& rm -rf /var/lib/apt/lists/*

RUN pip install --upgrade pip \
	&& pip install -r requirements.txt

COPY . .

RUN chmod +x entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["bash", "entrypoint.sh"]
