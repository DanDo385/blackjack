package handlers

import (
  "encoding/json"
  "net/http"
)

func GetUserSummary(w http.ResponseWriter, r *http.Request){
  // sample metrics including requested risk stat
  summary := map[string]any{
    "evPer100":  -0.8,      // %
    "sigmaPer100": 12.4,    // %
    "skillScore": 101.7,    // 0-120 scale, >100 disciplined
    "tiltIndex": 0.32,      // 0..1 higher == more tilt
    "luck10d": 0.5,         // “10d_luck_realized”
    "riskAdjDelta": 7,       // when 10d_luck_realized .5, risk +7
    "returnAdjDelta": -6,    // and return -6 (show this line in UI)
  }
  json.NewEncoder(w).Encode(summary)
}

func GetUserHands(w http.ResponseWriter, r *http.Request){
  rows := []map[string]any{
    {"handId":1,"bet":100,"result":"lose","payout":0,"ts":"2025-10-29T12:00:00Z"},
    {"handId":2,"bet":100,"result":"win","payout":200,"ts":"2025-10-29T12:01:00Z"},
  }
  json.NewEncoder(w).Encode(rows)
}


