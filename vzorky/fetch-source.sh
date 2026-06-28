#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# fetch-source.sh — stiahne klientsky zdroj vzorkovníka z GitHubu
#   - vzorky/src/konfigurator.jsx       (kompilovaný zdroj)
#   - vzorky/src/index.original.html    (referencia, ako to klient spúšťa)
#   - vzorky/images/<...>               (LEN referencované obrázky, nie celých 110 MB)
#
# Vyžaduje: gh (GitHub CLI, prihlásený), base64
# Použitie:  yarn vzorky:fetch   (alebo: bash vzorky/fetch-source.sh)
# Potom:     yarn build:vzorky
# ---------------------------------------------------------------------------
set -euo pipefail

REPO="luxusnerohoze-dev/vzorky"
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "[fetch] konfigurator.jsx + index.original.html"
gh api "repos/$REPO/contents/konfigurator.jsx" --jq '.content' | base64 -d > "$DIR/src/konfigurator.jsx"
gh api "repos/$REPO/contents/index.html"        --jq '.content' | base64 -d > "$DIR/src/index.original.html"

echo "[fetch] parsujem referencované obrázky z konfigurator.jsx"
# IMG("...")      -> web/...
# IMG_PATH("...") -> product/...
mapfile -t REFS < <(
  grep -oE 'IMG(_PATH)?\("[^"]+"\)' "$DIR/src/konfigurator.jsx" \
    | sed -E 's/IMG_PATH\("/product\//; s/IMG\("/web\//; s/"\)//' \
    | sort -u
)
echo "[fetch] referencií: ${#REFS[@]}"

ok=0; fail=0
for rel in "${REFS[@]}"; do
  dest="$DIR/images/$rel"
  mkdir -p "$(dirname "$dest")"
  if gh api "repos/$REPO/contents/images/$rel" --jq '.content' 2>/dev/null | base64 -d > "$dest" 2>/dev/null && [ -s "$dest" ]; then
    ok=$((ok+1))
  else
    rm -f "$dest"                       # nenechaj prázdny súbor (build ho berie ako missing)
    fail=$((fail+1)); echo "[fetch]   chýba v repe (placeholder pri builde): $rel"
  fi
done
echo "[fetch] stiahnuté=$ok  chýbajúce=$fail"
echo "[fetch] hotovo → spusti: yarn build:vzorky"
