from fastapi import FastAPI
from dotenv import load_dotenv
import os

load_dotenv("../../.env")

app = FastAPI(title="Finance Bridge", version="1.0.0")

_logged_in = False


@app.on_event("startup")
async def startup():
    global _logged_in
    try:
        import robin_stocks.robinhood as rh
        username = os.getenv("ROBINHOOD_EMAIL")
        password = os.getenv("ROBINHOOD_PASSWORD")
        if username and password:
            rh.login(username, password)
            _logged_in = True
            print("Robinhood login successful")
        else:
            print("Robinhood credentials not configured — bridge will return errors")
    except Exception as e:
        print(f"Robinhood login failed: {e}")


@app.get("/portfolio")
async def portfolio():
    from connectors.robinhood import get_portfolio
    return get_portfolio()


@app.get("/positions")
async def positions():
    from connectors.robinhood import get_positions
    return get_positions()


@app.get("/transactions")
async def transactions():
    from connectors.robinhood import get_transactions
    return get_transactions()


@app.get("/health")
async def health():
    return {"status": "ok", "logged_in": _logged_in}
