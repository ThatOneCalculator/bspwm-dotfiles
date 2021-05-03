#!/bin/sh

sxhkd -c $HOME/.config/sxhkd/sxhkdrc &
bspcomp &
#dcnnt &
/usr/lib/lxpolkit/lxpolkit &
xsettingsd &
exec dbus-launch --exit-with-session bspwm
