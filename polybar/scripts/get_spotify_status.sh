#!/bin/bash

playerstatus=$(playerctl status 2>&1)

case "$playerstatus" in
	"No players found") echo "";;
	"Stopped") echo "Paused";;
	*)
		status=$(playerctl --player=playerctld metadata --format "{{ title }}")
		 if [[ "${#status}" > 29 ]]; then
    		formatted=${status:0:29}...
    	else
    		formatted=$status
    	fi
    echo $formatted
esac
