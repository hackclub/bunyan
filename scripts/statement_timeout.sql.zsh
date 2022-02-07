#!/usr/bin/env zsh

local sdir="${0:a:h}"

psql --quiet --tuples-only --echo-queries -c \
    "ALTER ROLE ${PGUSER:-${1:-$USER}} SET statement_timeout TO '${2:-90}s'";
