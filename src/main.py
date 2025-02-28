import os

from chainlit.utils import mount_chainlit
from fastapi import FastAPI
from dotenv import load_dotenv

load_dotenv()

# Map environment to target path
env = os.getenv("ENV", "development")

target = {"development": "app.py", "production": "app.py"}.get(env)

app = FastAPI()
mount_chainlit(app=app, target=target, path="/sales")
