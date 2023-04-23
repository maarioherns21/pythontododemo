from fastapi import FastAPI
from mangum import Mangum

app = FastAPI()

# wraps the app so it can be understand by lamnda function interface
handler = Mangum(app)


@app.get("/")
async def root():
    return {"message": "Hello from ToDo API!"}