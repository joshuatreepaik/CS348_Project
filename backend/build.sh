#!/usr/bin/env bash
# build.sh

python manage.py migrate
python manage.py collectstatic --noinput