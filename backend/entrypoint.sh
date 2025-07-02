#!/bin/bash

if [ "$1" = "web" ]; then
    if [ "$CAN_MIGRATE" = "1" ]; then
        python manage.py migrate
        python manage.py makemigrations
    fi

    if [ "$CAN_COLLECTSTATIC" = "1" ]; then
        python manage.py collectstatic --noinput
    fi
    
    exec daphne sociallty.asgi:application -b 0.0.0.0 -p 8000

elif [ "$1" = "celery" ]; then
    exec celery -A sociallty worker -l INFO
fi
