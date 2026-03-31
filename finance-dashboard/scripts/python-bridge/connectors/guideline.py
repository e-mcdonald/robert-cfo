import csv
import os
from pathlib import Path


def parse_guideline_csv(file_path: str) -> list[dict]:
    """Parse a Guideline 401k CSV export."""
    transactions = []
    with open(file_path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            try:
                # Guideline CSV columns: Date, Description, Amount, Balance
                date = row.get("Date", "").strip()
                description = row.get("Description", "").strip()
                amount_str = row.get("Amount", "0").strip().replace("$", "").replace(",", "")
                amount = float(amount_str)
                transactions.append({
                    "id": f"guideline_{date}_{description.replace(' ', '_')}",
                    "date": date,
                    "description": description,
                    "amount": amount,
                })
            except (ValueError, KeyError):
                continue
    return transactions


def parse_all_csvs(uploads_dir: str) -> list[dict]:
    """Parse all CSV files in the guideline uploads directory."""
    all_transactions = []
    path = Path(uploads_dir)
    for csv_file in path.glob("*.csv"):
        all_transactions.extend(parse_guideline_csv(str(csv_file)))
    return all_transactions
