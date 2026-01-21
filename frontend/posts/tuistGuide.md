---
title: "Tuist 사용" 
date: "2026-01-08"
---

# Tuist 사용안내

## 간단 소개
- Tuist  Apple 전체platform을 위한 프로젝트관리툴입니다.
- iOS, iPadOS, macOS, tvOS, watchOS, visionOS


## Tuist 설치
- brew로 mise를 설치하세요.
- mise로 tuist를 설치하세요.
``` bash

    //brew를 통하여 mise를 설치합니다.
    brew install mise
    
    //mise를 활성화 하세요.
    echo 'eval "$(mise activate zsh)"' >> ~/.zshrc 
    
    //저용합니다.
    source ~/.zshrc 
    
    //설치되였는지 확인합니다.
    mise --version
      
/*    
    ❯ mise --version
              _                                        __
   ____ ___  (_)_______        ___  ____        ____  / /___ _________
  / __ `__ \/ / ___/ _ \______/ _ \/ __ \______/ __ \/ / __ `/ ___/ _ \
 / / / / / / (__  )  __/_____/  __/ / / /_____/ /_/ / / /_/ / /__/  __/
/_/ /_/ /_/_/____/\___/      \___/_/ /_/     / .___/_/\__,_/\___/\___/
                                            /_/                 by @jdx
2026.1.5 macos-arm64 (2026-01-19)
*/     
     
     
     
    //tuist에 어떤 버전있는가 볼수 있서요
    mise ls-remote tuist

/*
요렇게 쪼로로 나와요.
4.128.2
4.128.3
4.129.0
*/

    //tuist를 설치합니다.
    mise install tuist@4.129.0
/*
실패할경우가 있서요. 아래 명령어를 실행해주세요.
  mise plugins uninstall tuist || true
  mise plugins install tuist https://github.com/mise-plugins/mise-tuist.git
*/
```

## Tuist를 사용하여 프로젝트초기화
```bash

tuist init

/*
  How would you like to start with Tuist?
    ❯ Create a generated project
      Integrate the Xcode project or Swift Package
  ↑/↓/k/j up/down • enter confirm
  
  새로 project를 만들건가 기존에 있는 project로 할건가
*/

/*
  Would you like use server features (e.g. selective testing, previews)?  Yes (y)  /  No (n)
  You'll need to authenticate and create a project
  clould능력을 가지겠는가
  是否需要云端能力 
  
  功能              免费              付费
Tuist CLI            ✅               ❌
本地缓存              ✅               ❌
项目生成              ✅               ❌
单人开发              ✅               ❌
远程缓存（小量）       ✅               ⚠️ 원격cache(소량)
远程缓存（大 CI）      ❌               ✅ 원격cache(대량)
构建分析 Dashboard    ❌               ✅ 빌드분석
企业支持              ❌               ✅ 
*/
```

### project 구조
```bash

IMQAGuide
├── IMQAGuide
│    ├── Resources
│    ├── Sources
│    └── Tests
├── mise.toml
├── Project.swift
├── Tuist
│    └── Package.swift
└── Tuist.swift
```

## 프로젝트를 편집합니다.
``` bash
    
    tuist edit
    //Project.swift를 편집합니다.

tuist generate

# 清理生成的文件
tuist clean
```

## 프로젝터 편집
``` bash

# 打开生成的 Xcode 项目
tuist edit
```

## 프로젝터Setting
``` bash

Project.swift

import ProjectDescription

let project = Project(
    name: "MyApp",
    targets: [
        .target(
            name: "MyApp",
            platform: .iOS,
            product: .app,
            bundleId: "com.example.myapp",
            infoPlist: "Info.plist",
            sources: ["Sources/**"],
            resources: ["Resources/**"],
            dependencies: [
                .project(target: "MyFramework", path: "../MyFramework")
            ]
        ),
        .target(
            name: "MyAppTests",
            platform: .iOS,
            product: .unitTests,
            bundleId: "com.example.myapp.tests",
            infoPlist: .default,
            sources: ["Tests/**"],
            dependencies: [
                .target(name: "MyApp")
            ]
        )
    ]
)

```

```bash

import ProjectDescription

let project = Project(
    name: "projectName",
    organizationName: "company",
    targets: [
        .target(name: "TargetName",
                destinations: .iOS,
                product: .staticFramework,
                bundleId: "com.company.TargetName",
#                iOS 支持的最低版本
                deploymentTargets: .iOS("12.0"),
#               文件路径                
                sources: ["IMQASDK/IMQACore/**/*.swift"],
#               资源路径 
                resources: [
                    "IMQASDK/IMQACore/PrivacyInfo.xcprivacy"
                ],
#               依赖target 
                dependencies: [.target(name: "A"),
                               .target(name: "ACoreResources")],
#               buildSetting                               
                settings: .settings(base: [
#                衍生产物路径
                    "BUILD_DIR": "$(PROJECT_DIR)/Build",
#                Swift target：必须开
#                ObjC target： 开/不开都 功能等价， 通常不开
#               作用时swift 版本有5.9， 如果版本上升变5.10， 容易炸
                    "BUILD_LIBRARY_FOR_DISTRIBUTION": "YES",
#               决定 产物会不会被导出 / archive
#               App时 YES， Framework/SDK NO
                    "SKIP_INSTALL": "NO",
#               SDK / Framework：一般保持默认（Release = YES，Debug = NO）
#               除非你非常确定没有 runtime 反射 / hook / category / swizzle 为了保住+load 这种方法的
//                    "DEAD_CODE_STRIPPING": "NO",
#               自动链接libc++，libobjc，Foundation
#               一般情况默认YES， 做C/runtime 特殊嵌入式环境时NO
                    "LINK_WITH_STANDARD_LIBRARIES" : "YES",
#               是否把 Swift runtime 嵌入产物
#               App yes， SDK/Framework NO，
#               sdk打开了会怎样， 可能导致app 重复潜入Swift runtime，app store 审核警告， 体积变大
                    "ALWAYS_EMBED_SWIFT_STANDARD_LIBRARIES" : "YES",
#               告诉编译器：这个 target 是一个 module
#               ObjC-only target：必须开   oc target必须开
#               Swift target 默认就是module
                    "DEFINES_MODULE" : "YES"
                    
#                    对每一个 target，从上往下问：
#Q1：这个 target 里有没有 Objective-C 代码？
#	•	❌ 没有 → 不需要 -ObjC / -force_load
#	•	✅ 有 → 继续

#Q2：有没有 Category / +load / Swizzle / Hook / Runtime 注册？
#	•	❌ 没有（只是普通类，被显式调用）→ 通常不需要
#	•	✅ 有 → 继续

#Q3：这个 target 是 静态库（.a） 还是 动态库（.framework）？
#	•	🧱 静态库 → 必须考虑
#	•	📦 动态 Framework → 通常不需要
                ])),
        
            .target(name: "A",
                    destinations: .iOS,
                    product: .staticFramework,
                    bundleId: "com.Company.A",
                    deploymentTargets: .iOS("12.0"),
                    sources: ["IMQASDK/IMQADeviceInfo/**"],
                    headers: .headers(public: "IMQASDK/A/**/*.h"),
                    dependencies: [],
                    settings: .settings(base: [
#                   OBJECT-C 头文件搜索路径 
                        "HEADER_SEARCH_PATHS": ["$(SRCROOT)/IMQASDK/IMQADeviceInfo"],
#                  	•	ObjC 内部工具模块
#               	•	供 Swift SDK 使用
#               	•	或多个 target 之间共享
#               	•	module 名字 ≠ target 名字时，要非常小心
#               	•	modulemap 路径错误 → 编译直接炸
#               	•	如果同时设置了 DEFINES_MODULE = YES，要确保 不冲突

                        "MODULEMAP_FILE": "$(SRCROOT)/IMQASDK/IMQADeviceInfo/module.modulemap",
                        "BUILD_DIR": "$(PROJECT_DIR)/Build",
                        "BUILD_LIBRARY_FOR_DISTRIBUTION": "YES",
                        "SKIP_INSTALL": "NO",
//                        "DEAD_CODE_STRIPPING": "NO",
                        "LINK_WITH_STANDARD_LIBRARIES" : "YES",
                        "ALWAYS_EMBED_SWIFT_STANDARD_LIBRARIES" : "YES",
                        "DEFINES_MODULE" : "YES"
                    ])),
        
            .target(name: "IMQACoreTest",
                    destinations: .iOS,
                    product: .unitTests,
                    bundleId: "com.onycom.IMQACoreTest",
                    deploymentTargets: .iOS("12.0"),
                    sources: ["IMQASDK/IMQACoreTests/**"],
                    dependencies: [.target(name: "IMQACore")],
                    settings: .settings(base: [
                        "BUILD_DIR": "$(PROJECT_DIR)/Build",
//                        "BUILD_LIBRARY_FOR_DISTRIBUTION": "YES",
//                        "SKIP_INSTALL": "NO",
//                        "LINK_WITH_STANDARD_LIBRARIES" : "YES",
//                        "ALWAYS_EMBED_SWIFT_STANDARD_LIBRARIES" : "YES"
                    ])
                   ),
        .target(name: "IMQACoreResources",
                destinations: .iOS,
                product: .bundle,
                bundleId: "com.onycom.IMQACore.resources",
                resources: [
            "IMQASDK/IMQACore/PrivacyInfo.xcprivacy"
                ],
                settings: .settings(base: [
#                bundle 一般这么设置 
#                是否允许签名
#               含义
#
#               不允许对这个 target 进行代码签名
#
#               Bundle 的现实情况
#           	•	没有可执行 Mach-O
#             	•	没有代码
#           	•	签名毫无意义
                        "CODE_SIGNING_ALLOWED": "NO",
#                Release / Archive，也不强制签名        
                        "CODE_SIGNING_REQUIRED": "NO",
#                Archive / Install 阶段 不单独导出这个 target
                        "SKIP_INSTALL": "YES"
                    ])
               )        
    ]
)



```

``` bash
Workspace.swift

import ProjectDescription

let workspace = Workspace(
    name: "MyWorkspace",
    projects: [
        "App",
        "Modules/**"
    ],
    additionalFiles: [
        "Documentation/**",
        ".swiftlint.yml"
    ]
)
```

## 常用命令
``` bash
# 查看所有命令
tuist --help

# 查看版本
tuist version

# 生成图表
tuist graph

# 运行任务
tuist run <task-name>

# 环境管理
tuist local
tuist bundle
```

