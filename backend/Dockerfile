FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY manage.py .
COPY backend backend/

EXPOSE 10000

CMD ["sh", "-c", "python manage.py runserver 0.0.0.0:$PORT"]
