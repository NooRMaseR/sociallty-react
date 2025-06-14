#!/bin/bash

# make migrations for DB
python manage.py makemigrations
python manage.py migrate

# Collect static files
python manage.py collectstatic --noinput

# Start Daphne
exec daphne sociallty.asgi:application -b 0.0.0.0 -p 8000