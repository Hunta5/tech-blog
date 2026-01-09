---
title: "Tuist 사용" 
date: "2026-01-08"
---

# Tuist 사용안내

## Tuist 설치
``` bash
brew install tuist
```

## 초기화 프로젝터
``` bash
# 创建新项目
tuist init --platform ios --name MyApp

# 进入项目目录
cd MyApp
```

## 프로젝터 생성
``` bash
# 生成 Xcode 项目
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