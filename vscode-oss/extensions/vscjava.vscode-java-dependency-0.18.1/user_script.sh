# DOWNLOAD JDK AND SET UP ENVIRONMENT

echo "start downloading jdk..."
mkdir ~/JDK
wget -nv https://github.com/AdoptOpenJDK/openjdk11-binaries/releases/download/jdk-11.0.8%2B10/OpenJDK11U-jdk_x64_linux_hotspot_11.0.8_10.tar.gz -O ~/JDK/jdk.tar.gz

echo "start installing jdk..."
tar xzf ~/JDK/jdk.tar.gz -C ~/JDK
export JAVA_HOME=~/JDK/jdk-11.0.8+10
export PATH=$JAVA_HOME/bin:$PATH

echo "##vso[task.setvariable variable=JAVA_HOME]$JAVA_HOME"
echo "##vso[task.setvariable variable=PATH]$PATH"