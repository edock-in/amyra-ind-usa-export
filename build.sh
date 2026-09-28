#!/bin/sh
# Assembles src/ into:
#   index.html        the game as a standalone page you can open or host anywhere
#   artifact.html     the same page without the document wrapper, for hosts that add
#                     their own doctype, charset and viewport (such as Claude artifacts)
#   guide/index.html  the written guide as a standalone page
# No dependencies. Run it after every change in src/ and commit the results.
set -e
cd "$(dirname "$0")"

TITLE="The Journey of One Box"
DESC="A pixel-art game that shows anyone in India how to export a product and sell it on Amazon USA, in plain words."
GUIDE_TITLE="Made in India, Sold on Amazon"
GUIDE_DESC="A plain-words, step-by-step guide to exporting from India and selling on Amazon abroad."
URL="https://games.edock.io/amyra-ind-usa-export"

# The head and body tags are optional in HTML. Leaving them out lets the parser put
# the title, fonts and styles from src/ into the head, as in the Artifact host.
wrap() { # $1 title, $2 description, $3 url, $4 theme colour
  printf '<!doctype html>\n<html lang="en">\n<meta charset="utf-8">\n'
  printf '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
  printf '<meta name="description" content="%s">\n' "$2"
  printf '<meta property="og:title" content="%s">\n<meta property="og:description" content="%s">\n' "$1" "$2"
  printf '<meta property="og:url" content="%s">\n<meta property="og:type" content="website">\n' "$3"
  printf '<meta name="theme-color" content="%s">\n' "$4"
  printf '<link rel="canonical" href="%s">\n' "$3"
}

{
  cat src/head.html
  cat src/body.html
  echo '<script>'
  cat src/art.js src/audio.js src/world.js src/content.js src/hinglish.js src/game.js
  echo '</script>'
} > artifact.html

{
  wrap "$TITLE" "$DESC" "$URL" "#1A1D3A"
  cat artifact.html
  printf '</html>\n'
} > index.html

mkdir -p guide
{
  wrap "$GUIDE_TITLE" "$GUIDE_DESC" "$URL/guide/" "#F5F8F7"
  cat src/guide.html
  printf '</html>\n'
} > guide/index.html

echo "built index.html ($(wc -c < index.html | tr -d ' ') bytes), artifact.html, guide/index.html"
