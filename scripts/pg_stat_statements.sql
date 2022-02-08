#!/usr/bin/env zsh

local sdir="${0:a:h}"

read -r -d '' cmd <<'EOF'
psql --quiet --tuples-only --echo-queries -c \
    "CREATE extension pg_stat_statements;"
EOF

sudo su postgres -c "$cmd"
