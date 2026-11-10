FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN --mount=type=secret,id=cloud_ca if [ -f /run/secrets/cloud_ca ]; then export PIP_CERT=/run/secrets/cloud_ca; fi; pip install --no-cache-dir -r requirements.txt
COPY --chown=10001:10001 . .
RUN useradd --uid 10001 --create-home app
USER app
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
