package handlers

import (
  "encoding/json"
  "net/http"
)

func GetTreasuryOverview(w http.ResponseWriter, r *http.Request) {
  positions := []map[string]any{
    {"token":"USDC","pct":40},{"token":"WETH","pct":25},
    {"token":"WBTC","pct":10},{"token":"Perps Basis","pct":15},{"token":"LP/Yield","pct":10},
  }
  pnl := make([]map[string]any,0,60)
  base := 1000.0
  for i:=0;i<60;i++{ pnl = append(pnl, map[string]any{"d":i,"v": base + float64(i)*2.0 }) }

  json.NewEncoder(w).Encode(map[string]any{
    "positions": positions, "equitySeries": pnl,
  })
}


