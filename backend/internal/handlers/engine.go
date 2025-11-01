package handlers

import (
  "encoding/json"
  "net/http"
)

func GetEngineState(w http.ResponseWriter, r *http.Request) {
  resp := map[string]any{
    "trueCount": 1.4, "shoePct": 62,
    "anchor": 100.0, "spreadNum": 4.0, "lastBet": 120.0,
    "growthCapBps": 3300, "tableMin": 5.0, "tableMax": 5000.0,
  }
  w.Header().Set("Content-Type","application/json")
  json.NewEncoder(w).Encode(resp)
}

func PostBet(w http.ResponseWriter, r *http.Request) {
  // accept token, amount; return fake handId
  w.Header().Set("Content-Type","application/json")
  json.NewEncoder(w).Encode(map[string]any{"handId": 1234, "ok": true})
}


