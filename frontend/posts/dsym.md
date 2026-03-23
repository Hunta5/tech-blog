---
title: "Dsymfile 분석"
date: "2026-02-06"
---

sdk에서 보내는 data

Contents

[{"symbol_addr":4307107840,"instruction_addr":4307124564,"uuid":"E43A875E-A847-3ABB-8D6E-2B42FF2D0407","object_name":"IMQATester","object_addr":4307107840}, {"object_addr":4307107840,"symbol_addr":4307107840,"instruction_addr":4307176932,"object_name":"IMQATester","uuid":"E43A875E-A847-3ABB-8D6E-2B42FF2D0407"}, {"instruction_addr":4307176704,"symbol_addr":4307107840,"object_addr":4307107840,"object_name":"IMQATester","uuid":"E43A875E-A847-3ABB-8D6E-2B42FF2D0407"}, {"instruction_addr":4307134752,"uuid":"E43A875E-A847-3ABB-8D6E-2B42FF2D0407","symbol_addr":4307107840,"object_addr":4307107840,"object_name":"IMQATester"}]

binary_images를 보낸다




서버에서 binary_images를 읽고
image_map = [ { "name": "IMQATester", "uuid": "E43A875E-A847-3ABB-8D6E-2B42FF2D0407", "start": 4307107840, "end": 4307107840 + 4046848, "image_addr": 4307107840 }, { "name": "CoreFoundation", "uuid": "5E873A4F-XXXX-XXXX-XXXX-XXXXXXXXXXXX", "start": 6775721984, "end": 6775721984 + 5000000, "image_addr": 6775721984 } ]

이런데이터 생성한다.

Contents의 instruction_addr 로 image_map에서 조건이거로  (start<= instruction_addr <end) 이분 탐색으로 데이타를 찾는다  그후 uuid를 얻는다 얻는데이터를  저장할시 object_name : uuid로 저장LRU 다음에서 안찾도되니까


서버는 버전별 uuid의 dysmfile를 갔고 있서야 한다.




下载东西 다운할거
https://www.swift.org/install/linux/

sudo apt-get update
sudo apt-get install llvm

Data 를 받은후 우선 mapping 파일의 uuid를 출력한다.
1:llvm-dwarfdump --uuid IMQATester.app.dSYM/Contents/Resources/DWARF/IMQATester

돌려받는값:
UUID: E43A875E-A847-3ABB-8D6E-2B42FF2D0407 (arm64) IMQATester.app.dSYM/Contents/Resources/DWARF/IMQATester

uuid와 sdk에서 보낸 uuid와 비교하여 같지 않으면 역난독화하지 안는다.

같으면

2: 获取虚拟基地址
llvm-objdump -p ./IMQATester.app.dSYM/Contents/Resources/DWARF/IMQATester | \
awk '/segname __TEXT/{getline; print $2}'
获取第一个地址（첫번째 주소값이 vmaddr）

돌려받는값:
0x0000000100000000
0x0000000100004000
0x0000000100323938
0x0000000100326db8
0x000000010032a240
0x0000000100334240
0x0000000100346000
0x0000000100364057
0x0000000100364cbe
0x00000001003677e0
0x0000000100386bb8
0x00000001003873bc
0x00000001003873c4
0x0000000100394290
0x000000010039cec0
0x00000001003a50ac
0x00000001003af220
0x00000001003af61c
0x00000001003b0cd4
0x00000001003b2898
0x00000001003b33ec
0x00000001003b7188
0x00000001003b7260
0x00000001003b73f4
0x00000001003b74ac
0x00000001003b75a4
0x00000001003c5878


3:  fileAddr= instructionaddr - objectAddr + vmaddr.  16진수


4: llvm-symbolizer --obj=IMQATester.app.dSYM/Contents/Resources/DWARF/IMQATester --default-arch=arm64 0x1000045d0 | xcrun swift-demangle
돌려받는 값:
❯ llvm-symbolizer --obj=IMQATester.app.dSYM/Contents/Resources/DWARF/IMQATester --default-arch=arm64 --inlining 0x1000040d0 | xcrun swift-demangle
-[CrashAction crashWildPointer]
/Users/huntapark/Desktop/SampleAppProject/TestSwift/App/Sources/Modules/FunctionTester/CrashViewController/ObjectC/CrashAction.m:31:1

5: formatting 한다

{
file： “CrashViewController.swift”,
function：”-[CrashAction crashWildPointer]”,
line: 31,
column:1,
instruction_addr:”0x102f10de4”,
object_addr:”0x102f00000”,
offset:”instruction_addr-object_addr”,
image:”object_name”//sdk 에서 보낸 data
}
