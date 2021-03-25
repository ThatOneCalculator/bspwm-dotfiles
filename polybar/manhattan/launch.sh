#!/usr/bin/env bash

. "${HOME}/.cache/wal/colors.sh"
background=$color0
background_alt=$color3
foreground=$color15
foreground_alt=$color2
highlight=$color4

# Terminate already running bar instances
killall -q polybar

# Wait until the processes have been shut down
while pgrep -u $UID -x polybar >/dev/null; do sleep 0.5; done

# Launch the bar
polybar ws -c "$HOME"/.config/polybar/manhattan/config.ini &
polybar left -c "$HOME"/.config/polybar/manhattan/config.ini &
polybar right -c "$HOME"/.config/polybar/manhattan/config.ini &

