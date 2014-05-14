#!/bin/bash

app_name="CopyInfoEditor"

# 创建app.nw文件
rm -rf output
cd ../ && rm -rf output && mkdir output
cp -r $app_name/* output
rm -rf output/Info.plist output/build.sh output/app.icns
cd output/
find . -type d -name ".svn" | xargs rm -rf
zip -r ../app.nw * > /dev/null;
rm -rf * && cd ../ && mv app.nw output/
mv output $app_name/ && cd $app_name
echo "create nw file success!"

#创建windows版本app
cp F:/tt-study/copyInfoEditor/* output/ && cd output
cat nw.exe app.nw > $app_name.exe
rm -rf nw.exe nwsnapshot.exe app.nw
cd ..
echo "create windows app success!"

#删除app.nw
rm -f app.nw