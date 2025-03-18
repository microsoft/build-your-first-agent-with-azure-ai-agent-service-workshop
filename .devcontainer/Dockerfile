FROM mcr.microsoft.com/devcontainers/python:3.13-bullseye

# Install pip for Python 3.13
RUN python -m pip install --upgrade pip

# Copy requirements.txt and install the packages
COPY ../src/requirements.txt .
RUN pip install -r requirements.txt

ENV ENVIRONMENT=container