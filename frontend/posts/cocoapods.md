---
title: "Cocoapods 설치및사용"
date: "2026-01-08"
---

# Cocoapods  설치및사용
## pod 설치및 init
``` bash
    #cocoapods 설치
    brew isntall cocoapods

    #버전확인
    pod --version

    #프로젝트 init
    pod init
    #Podfile 생성
 
```

## Podfile 소개
``` text
platform :ios, '13.0'

target 'YourApp' do
  use_frameworks!

  pod 'Alamofire'
  pod 'SnapKit'
end
```

## install
``` bash
    pod install
```

## 자주사용하는 명령어
```bash
  # 설치
  pod install

  # pod update
  pod update
  
  #local Specs 업데이트
  pod repo update
  
  #移除Cocoapods
  pod deinitegrate
  
  #清除缓存
  pod cache clean --all
  
  #查看可升级库
  pod outdated
```

## 고급사용법 podfile

```text
    #固定版本（生产环境必须）
    pod 'Alamofire', '~>5.8'
    
    #使用本地 Pod（你做 SDK 时必用）
    pod 'IMQASDK', :path => '../IMQASDK'
    
    #使用 Git 仓库
    pod 'MySDK', :git => 'https://github.com/xxx/MySDK.git', :branch => 'develop'
    
    #静态库 / 动态库控制
    use_frameworks! :linkage => :static
    
    #统一设置iOS 版本/编译参数
    post_install do |installer|
        installer.pods_project.targets.each do |target|
            target.build_configurations.each do |config|
                config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '13.0'
                config.build_settings['BUILD_DIR'] = '../Build' //build 폴드 자리바꾸기
                config.build_settings['OTHER_LDFLAGS'] = '$(inherited) -ObjC' //object-C 호환할수 있을가?

            end
        end
    end
```