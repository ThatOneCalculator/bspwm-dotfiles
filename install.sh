#!/bin/sh

sudo install -m755 ./bin/* /usr/bin
cp -r ./Pictures/* $HOME/Pictures/
cp -r ./bspwm $HOME/.config/
cp -r ./cava $HOME/.config/
cp -r ./kitty $HOME/.config/
cp -r ./micro $HOME/.config/
cp -r ./polybar $HOME/.config/
cp -r ./ranger $HOME/.config/
cp -r ./sxhkd $HOME/.config/
cp -r ./vscode-oss $HOME/.vscode-oss
cp ./picom.conf $HOME/.config/
cp ./zshrc $HOME/.zshrc

echo "Reminder to self to add in git clones for other stuff idk"
