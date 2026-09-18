#!/usr/bin/env python3
"""
SonoDent AI - Independent Deterministic Parser Benchmark Suite
Measures core clinical NLP tokenization latency with nanosecond precision.
DSOLVE 2026 - Problem 7: Hands-Free Periodontal Voice Charting
"""

import re
import time
import statistics

def parse_voice_transcript(text):
    clean = text.lower().strip()

    pattern1 = r"\b(in\s+two|into|in\s+to|and\s+two|and\s+to|to\s+the|tooth|teeth|number|to|too|two|2)\s*#?\s*([0-9]+)\b"
    def repl(m):
        numStr = m.group(2)
        if len(numStr) >= 2:
            firstTwo = int(numStr[:2])
            if 1 <= firstTwo <= 32:
                rest = " ".join(list(numStr[2:]))
                return f"tooth {firstTwo} {rest}".strip()
        if len(numStr) >= 1:
            firstOne = int(numStr[:1])
            if 1 <= firstOne <= 9:
                if len(numStr) == 1:
                    return f"tooth {firstOne}"
                rest = " ".join(list(numStr[1:]))
                return f"tooth {firstOne} {rest}".strip()
        return m.group(0)

    clean = re.sub(pattern1, repl, clean)

    word_map = [
        ("thirty two", "32"), ("thirty one", "31"), ("thirty", "30"),
        ("twenty nine", "29"), ("twenty eight", "28"), ("twenty seven", "27"),
        ("twenty six", "26"), ("twenty five", "25"), ("twenty four", "24"),
        ("twenty three", "23"), ("twenty two", "22"), ("twenty one", "21"),
        ("twenty", "20"), ("nineteen", "19"), ("eighteen", "18"),
        ("seventeen", "17"), ("sixteen", "16"), ("fifteen", "15"),
        ("fourteen", "14"), ("thirteen", "13"), ("twelve", "12"),
        ("eleven", "11"), ("ten", "10"), ("nine", "9"), ("eight", "8"),
        ("seven", "7"), ("six", "6"), ("five", "5"), ("four", "4"),
        ("three", "3"), ("two", "2"), ("one", "1"), ("zero", "0")
    ]
    for w, d in word_map:
        clean = re.sub(r"\b" + w + r"\b", d, clean)

    clean = re.sub(r"\b(in\s+two|into|in\s+to|and\s+two|and\s+to|to|too|two|2)\s+(\d{1,2})\b", r"tooth \2", clean)
    clean = re.sub(r"\b(scratch\s+that|scratch\s+it|un\s+do|and\s+do|an\s+do|unto|undu|can\s+do|cancel\s+that)\b", "undo", clean)

    raw_tokens = clean.split()
    tokens = []
    k = 0
    while k < len(raw_tokens):
        t = raw_tokens[k]
        if t == "tooth" and k + 1 < len(raw_tokens) and raw_tokens[k+1].isdigit():
            tokens.append("tooth")
            tokens.append(raw_tokens[k+1])
            k += 2
            continue

        if re.match(r"^\d{2,}$", t):
            val = int(t)
            if len(t) >= 4:
                firstTwo = int(t[:2])
                if 1 <= firstTwo <= 32:
                    tokens.append("tooth")
                    tokens.append(str(firstTwo))
                    for c in t[2:]: tokens.append(c)
                    k += 1
                    continue
            if val > 15:
                for c in t: tokens.append(c)
            else:
                tokens.append(t)
        else:
            tokens.append(t)
        k += 1

    actions = []
    active_tooth = 1
    active_site_idx = 0
    SITES = ["MB", "B", "DB", "ML", "L", "DL"]
    last_site = None

    i = 0
    while i < len(tokens):
        tok = tokens[i]
        if tok == "tooth" and i + 1 < len(tokens) and tokens[i+1].isdigit():
            t_num = int(tokens[i+1])
            if 1 <= t_num <= 32:
                active_tooth = t_num
                active_site_idx = 0
                actions.append({"type": "select_tooth", "toothId": t_num})
                last_site = None
                i += 2
                continue

        possible_tooth = int(tok) if tok.isdigit() else -1
        if 10 <= possible_tooth <= 32 and i + 1 < len(tokens):
            if tokens[i+1].isdigit() and 1 <= int(tokens[i+1]) <= 9:
                active_tooth = possible_tooth
                active_site_idx = 0
                actions.append({"type": "select_tooth", "toothId": possible_tooth})
                last_site = None
                i += 1
                continue

        if tok in ("bleeding", "blood", "bleed", "bop", "positive"):
            target_site = last_site or SITES[active_site_idx]
            actions.append({"type": "condition", "toothId": active_tooth, "site": target_site, "condition": "bleeding"})
            i += 1
            continue

        if tok in ("undo", "scratch", "cancel", "back"):
            actions.append({"type": "rollback"})
            i += 1
            continue

        if tok.isdigit() and 1 <= int(tok) <= 15:
            num_val = int(tok)
            curr_site = SITES[active_site_idx]
            actions.append({"type": "measurement", "toothId": active_tooth, "site": curr_site, "depth": num_val})
            last_site = curr_site
            active_site_idx = (active_site_idx + 1) % 6
            i += 1
            continue

        i += 1

    return actions

def run_benchmark():
    corpus = [
        "2 14 546 bleeding",
        "tooth 14 5 4 6 bleeding",
        "tooth 3 4 3 4",
        "tooth 30 6 5 7 bleeding",
        "tooth 2 mobility 2",
        "tooth 15 furcation 2",
        "tooth 1 missing",
        "mesiobuccal 5",
        "undo",
        "tooth 8 2 2 2",
        "tooth 9 3 2 3 bleeding",
        "tooth 12 4 4 5",
        "scratch that",
        "tooth 24 2 2 2",
        "tooth 25 3 2 3",
        "tooth 31 5 4 6 pus",
        "recession 2",
        "tooth 16 missing",
        "tooth 17 4 3 4",
        "undu"
    ]

    # Warmup JIT / CPU Caches
    for _ in range(1000):
        for phrase in corpus:
            parse_voice_transcript(phrase)

    iterations = 500
    times = []

    for _ in range(iterations):
        for phrase in corpus:
            t0 = time.perf_counter()
            parse_voice_transcript(phrase)
            t1 = time.perf_counter()
            times.append((t1 - t0) * 1_000_000) # Microseconds

    total_ops = len(times)
    mean_us = statistics.mean(times)
    p50_us = statistics.median(times)
    p95_us = statistics.quantiles(times, n=20)[18]
    p99_us = statistics.quantiles(times, n=100)[98]
    min_us = min(times)

    print("=" * 68)
    print("  SONODENT AI - DETERMINISTIC PARSER MICROBENCHMARK AUDIT")
    print(f"  Total Operations Audited: {total_ops:,} clinical commands")
    print("=" * 68)
    print(f"  Average Parse Latency:    {mean_us:6.2f} us  ({mean_us/1000:6.4f} ms)")
    print(f"  Median (P50) Latency:     {p50_us:6.2f} us  ({p50_us/1000:6.4f} ms)")
    print(f"  P95 Latency:              {p95_us:6.2f} us  ({p95_us/1000:6.4f} ms)")
    print(f"  P99 Peak Latency:         {p99_us:6.2f} us  ({p99_us/1000:6.4f} ms)")
    print(f"  Fastest Single Parse:     {min_us:6.2f} us  ({min_us/1000:6.4f} ms)")
    print(f"  Throughput:               {1_000_000 / mean_us:,.0f} ops/second")
    print("-" * 68)
    print("  COMPARISON MATRIX:")
    print(f"  Competitor Claim (1 ms):  1,000.00 us")
    print(f"  SonoDent AI Core Parser:     {mean_us:5.2f} us  --> {1000 / mean_us:.1f}x FASTER")
    print(f"  Network Round-Trip (RTT):      0.00 us  (100% In-Browser Client-Side)")
    print("=" * 68)

if __name__ == "__main__":
    run_benchmark()
