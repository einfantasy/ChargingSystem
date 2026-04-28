import msoffcrypto
import openpyxl
import sqlite3
import uuid
import io


def main():
    xlsx_path = "data.xlsx"
    db_path = "app.db"

    with open(xlsx_path, "rb") as f:
        enc = msoffcrypto.OfficeFile(f)
        enc.load_key(password="314159")
        out = io.BytesIO()
        enc.decrypt(out)
        out.seek(0)
        wb = openpyxl.load_workbook(out, data_only=True)

    ws = wb["Sheet1"]
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()

    # Build name -> StudentId lookup
    cur.execute("SELECT StudentId, Name FROM Students")
    student_map = {name: sid for sid, name in cur.fetchall()}

    inserted = 0
    failed = []
    # Excel rows 4 to 58 (1-indexed)
    for row_idx in range(4, 59):
        row = list(ws.iter_rows(min_row=row_idx, max_row=row_idx, values_only=True))[0]
        name = row[0]
        if not name:
            continue

        student_id = student_map.get(name)
        if not student_id:
            failed.append(f"Row {row_idx}: '{name}' not found in Students")
            continue

        recharge_hour = row[2] if row[2] else 0
        recharge_price = row[9] if row[9] else 0
        cost = row[10] if row[10] else 0

        rec_id = str(uuid.uuid4())
        cur.execute(
            "INSERT INTO Recharges (Id, StudentId, RechargePrice, RechargeHour, Date, Cost) VALUES (?, ?, ?, ?, ?, ?)",
            (rec_id, student_id, recharge_price, recharge_hour, "2026-01-01 00:00:00", cost),
        )
        inserted += 1

    conn.commit()
    conn.close()
    print(f"Done. Inserted {inserted} records.")
    for msg in failed:
        print(f"SKIP: {msg}")


if __name__ == "__main__":
    main()
