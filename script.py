import requests
import time
import yaml
from datetime import datetime, timedelta
import pandas as pd
import schedule
import mysql.connector
from dateutil import parser  # datetime 문자열을 datetime 객체로 변환하는 데 사용
from dotenv import load_dotenv
import logging
from typing import Dict, Optional
import os


load_dotenv()
BACKEND_API_URL = os.getenv('BACKEND_API_URL', 'http://13.209.60.49:8080/api/trades/statistics')
STATISTIC_API_URL = "http://13.209.60.49:8080/api/trades/statistics"



# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# 설정 파일 로드 (appkey, appsecret, etc.)
with open('kis_devlp.yaml', encoding='UTF-8') as f:
    _cfg = yaml.load(f, Loader=yaml.FullLoader)

# 기본 설정
ACCESS_TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ0b2tlbiIsImF1ZCI6IjViYTYyYTBmLTgyNzItNDY4YS05Mzk2LTZhYjkzZDA0YzVmMCIsInByZHRfY2QiOiIiLCJpc3MiOiJ1bm9ndyIsImV4cCI6MTczMTE2NzE3NiwiaWF0IjoxNzMxMDgwNzc2LCJqdGkiOiJQU2dSM0NLS3VwU3J1c0hhTE5nZ0FTVllJeFdFaExad21ycjUifQ.sW81E_cM6ZeFMma0iL8zFM6MPVpLKkTuauFz1YVDo2sRdWWRbHXm6fG0p3CTowAT5g9cMyeR-296Bvm_tnHKNw"
BASE_URL = "https://openapi.koreainvestment.com:9443"
HEADERS = {
    "content-type": "application/json",
    "authorization": f"Bearer {ACCESS_TOKEN}",
    "appkey": _cfg['my_app'],
    "appsecret": _cfg['my_sec'],
    "tr_id": "",
}

tracked_stocks = {}
virtual_trades = []
day_trade_list = []

# MySQL 연결 설정
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'database': os.getenv('DB_NAME'),
}

def check_and_update_profit_level(trade, current_price, profit_target, profit_key):
    profit_rate = (current_price - trade["buy_price"]) / trade["buy_price"] * 100
    if profit_rate >= profit_target and trade.get(profit_key) is None and trade["num_buys"] > 3:
        trade[profit_key] = {
            "price": current_price,
            "time": datetime.now(),
            "num_buy": trade["num_buys"]
        }
        virtual_sell(trade, trade["num_buys"], int(profit_key[-1]))  # Extract profit level from key


def validate_db_config() -> bool:
    """Validate that all required database configuration is present."""
    required_keys = ['user', 'password', 'database']
    return all(DB_CONFIG.get(key) for key in required_keys)

def connect_db() -> mysql.connector.connection.MySQLConnection:
    """Create and return a database connection."""
    if not validate_db_config():
        raise ValueError("Missing required database configuration. Check your .env file.")
    return mysql.connector.connect(**DB_CONFIG)

# 매매 종료 후 통계 계산 함수
def calculate_statistics():
    conn = None
    cursor = None
    try:
        # 데이터베이스 연결
        conn = connect_db()
        cursor = conn.cursor(dictionary=True)

        # 오늘 날짜 가져오기
        today = datetime.now().strftime('%Y-%m-%d')

        # 오늘 매매된 종목 중 수익이 발생한 종목들 조회
        query = """
            SELECT stock_name, stock_code, sell_price_1, sell_price_2, sell_price_3, trade_result
            FROM virtual_trades
            WHERE DATE(buy_time) = %s
        """
        cursor.execute(query, (today,))
        trades = cursor.fetchall()

        # 통계 계산
        total_trades = len(trades)
        total_wins = sum(1 for trade in trades if trade['trade_result'] == "승리")
        count_sell_price_1 = sum(1 for trade in trades if trade['sell_price_1'] is not None)
        count_sell_price_2 = sum(1 for trade in trades if trade['sell_price_2'] is not None)
        count_sell_price_3 = sum(1 for trade in trades if trade['sell_price_3'] is not None)

        statistics = {
            'total_trades': total_trades,
            'total_wins' : total_wins,
            'count_sell_price_1': count_sell_price_1,
            'count_sell_price_2': count_sell_price_2,
            'count_sell_price_3': count_sell_price_3,
            'date': today
        }
        return statistics

    except mysql.connector.Error as err:
        print(f"MySQL Error: {err}")
        return None
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

# 백엔드로 통계 전송 함수
def send_statistics_to_backend(statistics):
    try:
        response = requests.post(STATISTIC_API_URL, json=statistics)
        response.raise_for_status()
        print("Successfully sent statistics to backend.")
    except requests.exceptions.RequestException as e:
        print(f"Failed to send statistics to backend: {e}")


def initialize_trade_list():
    """매일 아침 거래 관련 전역 변수들을 초기화"""
    global day_trade_list, tracked_stocks, virtual_trades

    print("거래 리스트 초기화 시작...")
    day_trade_list = []
    tracked_stocks = {}
    virtual_trades = []
    print("거래 리스트 초기화 완료")
    send_status_update("Running", details="Trading lists initialized for new day")


def datetime_to_str(dt):
    """datetime 객체를 문자열로 변환"""
    return dt.strftime('%Y-%m-%d %H:%M:%S')

def str_to_datetime(dt_str):
    """문자열을 datetime 객체로 변환"""
    if isinstance(dt_str, datetime):
        return dt_str
    return datetime.strptime(dt_str, '%Y-%m-%d %H:%M:%S')

def datetime_to_YMD(dt) :
    return dt.strftime('%Y-%m-%d')



def send_status_update(status, details=None, error=None):
    data = {
        "status": status,
        "lastUpdateTime": time.strftime("%Y-%m-%d %H:%M:%S"),
        "details": details,
        "error": error
    }
    try:
        response = requests.post(BACKEND_API_URL, json=data)
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        print(f"Failed to send status update: {e}")

def find_stock_name(stock_code) :
    url = f"{BASE_URL}/uapi/domestic-stock/v1/quotations/search-info"
    HEADERS["tr_id"] = "CTPF1604R"
    params = {"PDNO": stock_code, "PRDT_TYPE_CD": "300"}
    try:
        response = requests.get(url, headers=HEADERS, params=params, timeout=20)  # 10초 타임아웃 설정
        response.raise_for_status()
        response_json = response.json()
        if response_json.get("output") and response_json["output"].get("prdt_abrv_name"):
            return response_json["output"]["prdt_abrv_name"]
        else:
            print(f"'output' 키나 'prdt_name' 키가 응답에 없습니다. 종목 코드: {stock_code}. 응답 내용: {response_json}")
            return None
    except requests.exceptions.RequestException as e:
        print(f"종목명 검색 실패 : {e}")
        send_status_update("Error", error=str(e))
        return None

def insert_trade(trade):
    if trade['condition'] == "0" :
        condition = "명함"
    else :
        condition = "후보"
    conn = None
    cursor = None
    try:
        conn = connect_db()
        if conn:
            cursor = conn.cursor()
            sql = """
            INSERT INTO virtual_trades (stock_code, stock_name, buy_price, buy_time, num_buys, condition_type)
            VALUES (%s, %s, %s, %s, %s, %s)
            """
            # datetime 객체를 문자열로 변환하여 저장
            cursor.execute(sql, (
                trade['stock_code'],
                trade['stock_name'],
                trade['buy_price'],
                trade['buy_time'],
                trade['num_buys'],
                condition
            ))
            conn.commit()
    except mysql.connector.Error as err:
        print(f"MySQL Error: {err}")
        send_status_update("Error", error=str(err))
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

def update_trade(trade, formatted_time_taken, profit):
    conn = None
    cursor = None
    try:
        conn = connect_db()
        if conn:
            if profit == 1 :
                cursor = conn.cursor()
                sql = """
                UPDATE virtual_trades
                SET reach_time_1 = %s, sell_price_1 = %s, num_buys = %s, trade_result = %s
                WHERE stock_code = %s AND buy_time = %s
                """
                cursor.execute(sql, (
                    formatted_time_taken,
                    trade['profit_1']['price'],
                    trade['profit_1']["num_buy"],
                    "승리",
                    trade['stock_code'],
                    trade['buy_time'],
                ))
                conn.commit()
            elif profit == 2:
                cursor = conn.cursor()
                sql = """
                UPDATE virtual_trades
                SET reach_time_2 = %s, sell_price_2 = %s, num_buys = %s, trade_result = %s
                WHERE stock_code = %s AND buy_time = %s
                """
                cursor.execute(sql, (
                    formatted_time_taken,
                    trade['profit_2']['price'],
                    trade['profit_2']["num_buy"],
                    "승리",
                    trade['stock_code'],
                    trade['buy_time'],
                ))
                conn.commit()
            elif profit == 3:
                cursor = conn.cursor()
                sql = """
                UPDATE virtual_trades
                SET reach_time_3 = %s, sell_price_3 = %s, num_buys = %s, trade_result = %s
                WHERE stock_code = %s AND buy_time = %s
                """
                cursor.execute(sql, (
                    formatted_time_taken,
                    trade['profit_3']['price'],
                    trade['profit_3']["num_buy"],
                    "승리",
                    trade['stock_code'],
                    trade['buy_time'],
                ))
                conn.commit()
    except mysql.connector.Error as err:
        print(f"MySQL Error: {err}")
        send_status_update("Error", error=str(err))
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

def get_access_token():
    global ACCESS_TOKEN, HEADERS
    token_url = f"{BASE_URL}/oauth2/tokenP"
    headers = {"content-type": "application/json"}
    data = {"grant_type": "client_credentials", "appkey": _cfg['my_app'], "appsecret": _cfg['my_sec']}
    try:
        response = requests.post(token_url, headers=headers, json=data, timeout=20)
        response.raise_for_status()
        ACCESS_TOKEN = response.json().get("access_token")
        HEADERS["authorization"] = f"Bearer {ACCESS_TOKEN}"
        print(f"Bearer {ACCESS_TOKEN}")
    except requests.exceptions.RequestException as e:
        print(f"Token 발급 실패: {e}")
        send_status_update("Error", error=str(e))

def search_conditions(condition_id):
    url = f"{BASE_URL}/uapi/domestic-stock/v1/quotations/psearch-result"
    HEADERS["tr_id"] = "HHKST03900400"
    params = {"seq": condition_id, "user_id": "@2410788"}
    try:
        response = requests.get(url, headers=HEADERS, params=params, timeout=20)  # 20초 타임아웃 설정
        response.raise_for_status()
        stocks = response.json().get("output2", [])
        if not stocks:
            print(f"조건 검색 결과가 없습니다. 조건 ID: {condition_id}")
        return stocks
    except requests.exceptions.RequestException as e:
        print(f"조건 검색 실패: {e}")
        send_status_update("Error", error=str(e))
        return []

def get_current_price(stock_code):
    url = f"{BASE_URL}/uapi/domestic-stock/v1/quotations/inquire-price"
    HEADERS["tr_id"] = "FHKST01010100"
    params = {"fid_input_iscd": stock_code, "fid_cond_mrkt_div_code": "J"}
    try:
        response = requests.get(url, headers=HEADERS, params=params, timeout=20)  # 10초 타임아웃 설정
        response.raise_for_status()
        response_json = response.json()
        if response_json.get("output") and response_json["output"].get("stck_prpr"):
            return float(response_json["output"]["stck_prpr"])
        else:
            print(f"'output' 키나 'stck_prpr' 키가 응답에 없습니다. 종목 코드: {stock_code}. 응답 내용: {response_json}")
            return None
    except requests.exceptions.RequestException as e:
        print(f"현재가 조회 실패: {e}")
        send_status_update("Error", error=str(e))
        return None

def virtual_buy(stock_code, price, condition):
    if price is None:
        print(f"가격 정보가 없습니다. 매수하지 않음. 종목 코드: {stock_code}")
        return

    stock_name = find_stock_name(stock_code)
    if not stock_name:
        print(f"종목명을 찾을 수 없어 매수를 중단합니다. 종목 코드: {stock_code}")
        return

    trade = {
        "stock_code": stock_code,
        "stock_name": stock_name,
        "buy_price": price,
        "buy_time": datetime.now().replace(microsecond=0),  # datetime 객체로 저장
        "num_buys": 1,
        "last_buy_time" : datetime.now(),
        "profit_1": None,
        "profit_2": None,
        "profit_3": None,
        "condition" : condition
    }
    virtual_trades.append(trade)
    insert_trade(trade)
    send_status_update("Running", details=f"가상 매수 시작 - 종목: {stock_code}, 포착가: {price}, 종목명: {stock_name}")
    print(f"가상 매수 시작 - 종목: {stock_code}, 포착가: {price}, 종목명: {stock_name}")

def virtual_sell(trade, num_buys, profit):
    last_buy_time = trade["buy_time"]
    time_taken = datetime.now() - last_buy_time  # 이미 datetime 객체이므로 변환 불필요
    formatted_time_taken = str(time_taken)
    print(f"가상 매도 완료 - 종목: {trade['stock_code']}, 수익률: {profit}%, 매수 후 경과 시간: {formatted_time_taken}, 매수횟수 : {num_buys}")
    update_trade(trade, formatted_time_taken, profit)
    if profit == 3 :
        virtual_trades.remove(trade)
        tracked_stocks.pop(trade['stock_code'], None)
    send_status_update("Running", details=f"가상 매도 완료 - 종목: {trade['stock_code']}, 수익: {profit}")

def update_buy(trade):
    conn = None
    cursor = None
    try:
        conn = connect_db()
        if conn:
            cursor = conn.cursor()
            sql = """
            UPDATE virtual_trades
            SET buy_price = %s, num_buys = %s
            WHERE stock_code = %s AND buy_time = %s
            """
            cursor.execute(sql, (
                trade['buy_price'],
                trade['num_buys'],
                trade['stock_code'],
                trade['buy_time']
            ))
            conn.commit()
    except mysql.connector.Error as err:
        print(f"MySQL Error: {err}")
        send_status_update("Error", error=str(err))
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


def update_failed_trade(trade, final_profit):
    conn = None
    cursor = None
    try:
        conn = connect_db()
        if conn:
            cursor = conn.cursor()
            sql = """
            UPDATE virtual_trades
            SET trade_result = %s
            WHERE stock_code = %s AND buy_time = %s
            """
            if final_profit > 0 :
                cursor.execute(sql, ("승리", trade['stock_code'], trade['buy_time']))
            else :
                cursor.execute(sql, ("패배", trade['stock_code'], trade['buy_time']))
            conn.commit()
    except mysql.connector.Error as err:
        print(f"MySQL Error: {err}")
        send_status_update("Error", error=str(err))
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

def update_stop_loss(trade, final_price):
    conn = None
    cursor = None
    try:
        conn = connect_db()
        if conn:
            cursor = conn.cursor()
            # trade['profit_1']가 None이 아니고, price 속성이 None이 아닌지 확인
            if trade.get('profit_1') and trade['profit_1'].get('price') is None:
                sql = """
                UPDATE virtual_trades
                SET stop_loss_price = %s, trade_result = %s
                WHERE stock_code = %s AND buy_time = %s
                """
                cursor.execute(sql, (final_price, "패배", trade['stock_code'], trade['buy_time']))
            else:
                sql = """
                UPDATE virtual_trades
                SET stop_loss_price = %s
                WHERE stock_code = %s AND buy_time = %s
                """
                cursor.execute(sql, (final_price, trade['stock_code'], trade['buy_time']))
            conn.commit()
    except mysql.connector.Error as err:
        print(f"MySQL Error: {err}")
        send_status_update("Error", error=str(err))
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

def trading_process():
    send_status_update("Running", details="Trading process started")
    target_time = datetime.now().replace(hour=15, minute=40, second=0, microsecond=0)
    while True:
        try:
            current_time = datetime.now()
            # 15시 40분 전에만 명후 검색

            # 현재 시간이 15:40 이전인지 확인
            if current_time < target_time:
                for condition_id in ["0", "2"]:
                    stocks = search_conditions(condition_id)
                    for stock in stocks:
                        stock_code = stock.get("code")
                        if stock_code is None:
                            print(f"잘못된 종목 데이터: {stock}")
                            continue
                        if stock_code in day_trade_list:
                            continue

                        # 현재가 조회
                        price = get_current_price(stock_code)

                        # 유효한 가격일 경우만 리스트에 추가하고 매수 진행
                        if price is not None:
                            day_trade_list.append(stock_code)
                            if stock_code not in tracked_stocks:
                                tracked_stocks[stock_code] = price
                                virtual_buy(stock_code, price, condition_id)


            for trade in virtual_trades[:]:
                current_price = get_current_price(trade["stock_code"])
                if current_price is None:
                    continue

                if trade["buy_price"] != 0:
                    profit_rate = (current_price - trade["buy_price"]) / trade["buy_price"] * 100
                else:
                    profit_rate = 0

                # 수익률 달성 시 매도 또는 기록
                if profit_rate >= 1.2 and trade["profit_1"] is None and trade["num_buys"] > 3:
                    trade["profit_1"] = {
                        "price": current_price,
                        "time": datetime.now(),
                        "num_buy" : trade["num_buys"]
                    }
                    print(f"1% 수익률 달성 - 종목: {trade['stock_code']}, 매도가: {current_price}")
                    virtual_sell(trade, trade["num_buys"],1)

                elif profit_rate >= 2.2 and trade["profit_2"] is None and trade["num_buys"] > 3:
                    trade["profit_2"] = {
                        "price": current_price,
                        "time": datetime.now(),
                        "num_buy" : trade["num_buys"]
                    }
                    print(f"2% 수익률 달성 - 종목: {trade['stock_code']}, 매도가: {current_price}")
                    virtual_sell(trade, trade["num_buys"],2)
                elif profit_rate >= 3.2 and trade["profit_3"] is None and trade["num_buys"] > 3:
                    trade["profit_3"] = {
                        "price": current_price,
                        "time": datetime.now(),
                        "num_buy" : trade["num_buys"]
                    }
                    print(f"3% 수익률 달성 - 종목: {trade['stock_code']}, 매도가: {current_price}")
                    virtual_sell(trade, trade["num_buys"],3)

                #손절
                elif profit_rate <= -4:
                    final_price = current_price
                    loss_amount = final_price - trade['buy_price']
                    print(f"손절 발생 - 종목: {trade['stock_code']}")
                    print(f"  → 매수가: {trade['buy_price']:,}원")
                    print(f"  → 손절가: {final_price:,}원")
                    print(f"  → 손실률: {profit_rate:.2f}%")
                    print(f"  → 손실금액: {loss_amount:,}원")
                    update_stop_loss(trade, final_price)
                    virtual_trades.remove(trade)
                    tracked_stocks.pop(trade['stock_code'], None)

                # 추가 매수 로직
                if trade["num_buys"] < 10 :
                    time_since_last_buy = current_time - trade["last_buy_time"]

                    # 정확히 3분 간격으로 매수
                    if time_since_last_buy >= timedelta(minutes=3):
                        # 장 마감 30분 전에는 추가 매수 중단
                        if current_time.hour < 15 or (current_time.hour == 15 and current_time.minute < 20):
                            trade["num_buys"] += 1
                            previous_total = trade["buy_price"] * (trade["num_buys"] - 1)
                            trade["buy_price"] = (previous_total + current_price) / trade["num_buys"]
                            trade["last_buy_time"] = current_time

                            # 매수 정보 업데이트 및 로깅
                            update_buy(trade)
                            print(f"추가 매수 실행 - 종목: {trade['stock_code']}")
                            print(f"  → 현재가: {current_price:,}원")
                            print(f"  → 평균단가: {trade['buy_price']:,.2f}원")
                            print(f"  → 매수 횟수: {trade['num_buys']}/10")
                            print(f"  → 현재 수익률: {profit_rate:.2f}%")

            # 장 마감 처리
            if current_time.hour == 15 and current_time.minute >= 20:
                for trade in virtual_trades:
                    final_price = get_current_price(trade["stock_code"])
                    if final_price:
                        final_profit_rate = (final_price - trade["buy_price"]) / trade["buy_price"] * 100
                        #update_failed_trade(trade, f"수익률 미달성 (최종 수익률: {final_profit_rate:.2f}%)")
                        print(f"미매도 종목 마감 - 종목: {trade['stock_code']}")
                        print(f"  → 최종 매수가: {trade['buy_price']:,}원")
                        print(f"  → 최종 현재가: {final_price:,}원")
                        print(f"  → 최종 수익률: {final_profit_rate:.2f}%")
                        print(f"  → 총 매수 횟수: {trade['num_buys']}")
                statistics = calculate_statistics()
                print(statistics)
                if statistics:
                    # 백엔드로 통계 전송
                    send_statistics_to_backend(statistics)
                send_status_update("Completed", details="Trading process ended")

                break

            time.sleep(1)  # 1초 간격으로 확인
        except Exception as e:
            print(f"Unhandled exception: {e}")
            send_status_update("Error", error=str(e))

def main():
    # 매일 9시에 토큰 발행 후 스크립트 실행

    schedule.every().day.at("08:50").do(initialize_trade_list)
    schedule.every().day.at("08:55").do(get_access_token)
    schedule.every().day.at("09:01").do(trading_process)
    while True:
        schedule.run_pending()
        time.sleep(1)

    # get_access_token()
    # trading_process()

    # statistics = calculate_statistics()
    # print(statistics)
    # if statistics:
    #     # 백엔드로 통계 전송
    #     send_statistics_to_backend(statistics)
    # send_status_update("Completed", details="Trading process ended")



if __name__ == "__main__":
    main()
