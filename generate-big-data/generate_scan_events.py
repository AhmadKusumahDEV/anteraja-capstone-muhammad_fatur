"""
Generator dataset simulasi `scan_events` (hub_id | package_id | event_type | timestamp)

Jalankan:   python generate_scan_events.py
Output   :  scan_events.csv  (~9.000 baris)

Dataset sengaja dibuat "kotor" supaya Data Quality Check bermakna:
  - missing ARRIVAL / missing DEPARTURE
  - duplicate scan
  - timestamp tidak valid (teks rusak, bulan/jam mustahil, kosong)
  - DEPARTURE terjadi sebelum ARRIVAL
  - event lain (SORTING) sebagai noise yang harus difilter
"""
import csv
import random
from datetime import datetime, timedelta

SEED = 42
random.seed(SEED)

N_PACKAGES = 2400
START = datetime(2023, 10, 1, 0, 0, 0)
DAYS = 30  # rentang 1 - 30 Oktober 2023

# ---------------------------------------------------------------
# Profil tiap hub: (probabilitas dipilih, median_jam, sigma_lognormal,
#                   prob_outlier_ekstrem)
# ---------------------------------------------------------------
HUBS = {
    "HUB-001": (0.14, 5.0, 0.35, 0.00),
    "HUB-002": (0.12, 6.0, 0.40, 0.00),
    "HUB-003": (0.13, 7.0, 0.40, 0.00),   # relatif tinggi tapi wajar
    "HUB-004": (0.10, 4.5, 0.30, 0.00),
    "HUB-005": (0.11, 11.0, 0.45, 0.00),  # volume besar + dwell tinggi konsisten
    "HUB-006": (0.08, 5.5, 0.35, 0.00),
    "HUB-007": (0.07, 6.5, 0.40, 0.00),
    "HUB-008": (0.06, 4.0, 0.30, 0.00),
    "HUB-009": (0.05, 5.0, 0.35, 0.00),
    "HUB-010": (0.03, 6.0, 0.40, 0.12),   # volume kecil, rata-rata terdongkrak outlier
    "HUB-011": (0.06, 8.5, 0.50, 0.00),
    "HUB-012": (0.05, 4.8, 0.30, 0.00),
}
HUB_IDS = list(HUBS.keys())
HUB_WEIGHTS = [HUBS[h][0] for h in HUB_IDS]

# Tingkat kotor per hub (HUB-007 sengaja lebih kotor)
DIRTY_BASE = {"missing_dep": 0.025, "missing_arr": 0.015, "reversed": 0.012,
              "bad_ts": 0.010, "dup": 0.020}
DIRTY_BOOST = {"HUB-007": 2.5}

FMT = "%Y-%m-%d %H:%M:%S"


def draw_dwell_hours(hub):
    _, median, sigma, p_out = HUBS[hub]
    if random.random() < p_out:
        return random.uniform(40, 96)          # paket "nyangkut"
    h = random.lognormvariate(0, sigma) * median
    return max(0.5, min(h, 72))


def rand_arrival():
    base = START + timedelta(days=random.randint(0, DAYS - 1))
    # jam kedatangan lebih padat siang-sore
    hour = int(min(23, max(0, random.gauss(13, 4.5))))
    return base.replace(hour=hour, minute=random.randint(0, 59), second=random.randint(0, 59))


def bad_timestamp():
    return random.choice([
        "invalid_ts", "N/A", "", "2023-13-45 99:00:00",
        "2023-02-30 10:00:00", "0000-00-00 00:00:00", "31/10/2023 25:61:00",
    ])


rows = []
meta = {"missing_dep": 0, "missing_arr": 0, "reversed": 0,
        "bad_ts": 0, "dup": 0, "sorting": 0, "clean_pairs": 0}

for i in range(1, N_PACKAGES + 1):
    pkg = f"PKG-{i:05d}"
    n_hops = random.choices([1, 2, 3], weights=[0.30, 0.50, 0.20])[0]
    hubs = random.sample(HUB_IDS, k=n_hops) if n_hops > 1 else \
        random.choices(HUB_IDS, weights=HUB_WEIGHTS)
    if n_hops > 1:  # pilih ulang dengan bobot volume, tanpa duplikat hub
        hubs = []
        while len(hubs) < n_hops:
            h = random.choices(HUB_IDS, weights=HUB_WEIGHTS)[0]
            if h not in hubs:
                hubs.append(h)

    t = rand_arrival()
    for hub in hubs:
        boost = DIRTY_BOOST.get(hub, 1.0)
        p = {k: v * boost for k, v in DIRTY_BASE.items()}

        arr = t
        dep = arr + timedelta(hours=draw_dwell_hours(hub))
        ev = [[hub, pkg, "ARRIVAL", arr.strftime(FMT)],
              [hub, pkg, "DEPARTURE", dep.strftime(FMT)]]

        r = random.random()
        if r < p["missing_dep"]:
            ev = [ev[0]]; meta["missing_dep"] += 1
        elif r < p["missing_dep"] + p["missing_arr"]:
            ev = [ev[1]]; meta["missing_arr"] += 1
        elif r < p["missing_dep"] + p["missing_arr"] + p["reversed"]:
            # DEPARTURE sebelum ARRIVAL
            dep_bad = arr - timedelta(hours=random.uniform(0.5, 10))
            ev[1][3] = dep_bad.strftime(FMT); meta["reversed"] += 1
        elif r < sum(p[k] for k in ("missing_dep", "missing_arr", "reversed", "bad_ts")):
            ev[random.randint(0, 1)][3] = bad_timestamp(); meta["bad_ts"] += 1
        else:
            meta["clean_pairs"] += 1

        # duplicate scan (event identik di-scan 2x)
        if random.random() < p["dup"]:
            ev.append(list(random.choice(ev))); meta["dup"] += 1

        # noise: event lain yang harus difilter
        if len(ev) >= 2 and random.random() < 0.06:
            mid = arr + (dep - arr) / 2
            ev.append([hub, pkg, "SORTING", mid.strftime(FMT)]); meta["sorting"] += 1

        rows.extend(ev)
        t = dep + timedelta(hours=random.uniform(2, 12))  # perjalanan ke hub berikutnya

random.shuffle(rows)  # log asli tidak berurutan

with open("scan_events.csv", "w", newline="", encoding="utf-8") as f:
    w = csv.writer(f)
    w.writerow(["hub_id", "package_id", "event_type", "timestamp"])
    w.writerows(rows)

print(f"Total baris : {len(rows):,}")
print(f"Ringkasan injeksi: {meta}")
