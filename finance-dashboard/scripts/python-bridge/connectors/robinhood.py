import robin_stocks.robinhood as rh


def get_portfolio():
    try:
        profile = rh.profiles.load_portfolio_profile()
        return {
            "total_value": float(profile.get("market_value", 0) or 0),
            "buying_power": float(profile.get("withdrawable_amount", 0) or 0),
            "equity": float(profile.get("equity", 0) or 0),
        }
    except Exception as e:
        return {"error": str(e), "total_value": 0, "buying_power": 0}


def get_positions():
    try:
        positions = rh.account.get_open_stock_positions()
        result = []
        for pos in positions:
            instrument = rh.stocks.get_instrument_by_url(pos.get("instrument"))
            result.append({
                "symbol": instrument.get("symbol", "UNKNOWN"),
                "quantity": float(pos.get("quantity", 0)),
                "average_buy_price": float(pos.get("average_buy_price", 0)),
            })
        return result
    except Exception as e:
        return {"error": str(e)}


def get_transactions():
    try:
        orders = rh.orders.get_all_stock_orders()
        result = []
        for order in orders[:50]:  # last 50
            if order.get("state") == "filled":
                result.append({
                    "id": order.get("id"),
                    "date": order.get("last_transaction_at", "")[:10],
                    "description": f"{order.get('side', '').title()} {order.get('symbol', '')}",
                    "amount": (
                        -float(order.get("executed_notional", {}).get("amount", 0))
                        if order.get("side") == "buy"
                        else float(order.get("executed_notional", {}).get("amount", 0))
                    ),
                })
        return result
    except Exception as e:
        return {"error": str(e)}
