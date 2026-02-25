import psycopg
import os
from dotenv import load_dotenv

load_dotenv()

DB_URL = os.getenv("DATABASE_URL")

try:

    conn = psycopg.connect(DB_URL)
    print("Connection Successful")

    # conn = psycopg.connect(
    #     host="192.168.68.125",
    #     port="5432",
    #     dbname="demo",
    #     user="openatk_user",
    #     password="Usui_Senpai21"
    # )
    # print("Connection to the remote server successful")

except psycopg.OperationalError as e:
    print(f"Connection failed: {e}")

finally:
    if conn:
        conn.close()