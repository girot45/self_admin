from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
# Разрешаем CORS для всех источников и методов
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Можно заменить на список допустимых доменов
    allow_credentials=True,
    allow_methods=["*"],  # Разрешаем все методы (GET, POST, OPTIONS и т. д.)
    allow_headers=["*"],  # Разрешаем все заголовки
)


@app.post("/test")
async def test():
    print(123)
    return {"message": "Success"}
