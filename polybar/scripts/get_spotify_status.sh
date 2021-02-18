#!/bin/bash

playerstatus=$(playerctl status 2>&1)

if [[ "$playerstatus" = "No players found" ]]; then
	echo ""
elif [[ "$playerstatus" = "Stopped" ]]; then
	echo "Paused"
else
    if [[ "$playerstatus" == "No players found" ]]; then
		echo ""
    else
    	a=$(playerctl --player=playerctld metadata --format "{{ title }}")
    fi
    if [[ "${#a}" > 40 ]]; then
    	b=${a:0:40}...
    else
    	b=$a
    fi
    #if [[ "$(playerctl --list-all 2>&1)" == *"mpv"* ]]; then
    #	echo $b
    #else
    #	echo $b $(playerctl --player=playerctld metadata --format " • {{ artist }}")
    #fi
    echo $b
fi
