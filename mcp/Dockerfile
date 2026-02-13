FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Expose port 3000 for SSE/HTTP
EXPOSE 3000

# Running with uvicorn assuming mcp object in server.py is ASGI compatible or wrapped
# If FastMCP isn't directly ASGI, we might need a different entrypoint.
# For now, this fixes the build.
CMD ["uvicorn", "server:mcp", "--host", "0.0.0.0", "--port", "3000"]
