FROM mcr.microsoft.com/devcontainers/python:3.13-bullseye

# Install pip for Python 3.13
RUN python -m pip install --upgrade pip

# Install the packages required to run the workshop as a student
COPY ../src/python/workshop/requirements.txt .
RUN pip install -r requirements.txt

# Install the packages required to build the instructions as a presenter
COPY ../docs/requirements.txt .
RUN pip install -r requirements.txt

ENV ENVIRONMENT=container