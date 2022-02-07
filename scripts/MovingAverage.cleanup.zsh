#!/usr/bin/env zsh

local sdir="${0:a:h}"

#source "${sdir}/../.env"

local timeAgo="`date --date='45 days ago' -u +'%Y-%m-%d'`"

local scriptSelect="$sdir"/sql/MovingAverage.SELECT.created_ASC_LIM_2.sql
local scriptDelete="$sdir"/sql/MovingAverage.DELETE_550k.sql

local psqlArgs=("--quiet" "--tuples-only")

for i in $(seq 0 256); do
    set -x
    local select1=`psql "${psqlArgs[@]}" -f "$scriptSelect" | head -n1`
    local latestDate=`echo "$select1" | cut -f2 -d'|' | grep -oe '[0-9-]\+' | head -n1`
    set +x
    if [[ $latestDate > $timeAgo ]]; then
        echo "DONE :)! $latestDate > $timeAgo"
        exit 0
    else
        echo "KEEP GOING D=! $latestDate <= $timeAgo"
    fi
    for j in $(seq 0 64); do
        echo $i - $j
        psql "${psqlArgs[@]}" -f "$scriptDelete"
    done
done
