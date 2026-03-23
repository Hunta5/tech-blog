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

## podspec 设置

```text
Pod::Spec.new do |s|
#名字
  s.name             = 'IMQACore'
#版本
  s.version          = '1.0.104'
#简介
  s.summary          = 'APM SDK by IMQA with crash reporting, device info, and OpenTelemetry integration.'
#详情
  s.description      = <<-DESC
  IMQACore is an iOS SDK for application performance monitoring, including crash capture, tracing, logging, and device information reporting.
  DESC
#主页
  s.homepage         = 'https://imqa.io'
#执照
  s.license          = { :type => 'Proprietary', :file => 'LICENSE' }
#作者
  s.author           = { 'Hunta' => 'hunta@onycom.com' }
#支持最低版本
  s.platform         = :ios, '12.0'
#swift的版本
  s.swift_version    = '5.0'
#github的地址
  s.source           = { :git => 'https://github.com/idlerecord/IMQACore.git', :tag => s.version }
#ARC模式还是MRC模式
  s.requires_arc = true
#静态库
  s.static_framework = true
#基础framework
  s.frameworks = 'Foundation', 'UIKit'
#build setting
  s.pod_target_xcconfig = {
#swift 版本
    'SWIFT_VERSION' => '5.0',
#是否模块化
    'DEFINES_MODULE' => 'YES',
#    'EXCLUDED_ARCHS[sdk=iphonesimulator*]' => 'x86_64 armv7 arm64',
#排除架构
    'EXCLUDED_ARCHS[sdk=iphonesimulator*]' => 'x86_64',
#架构
    'VALID_ARCHS' => 'x86_64 armv7 arm64',
#架构
    'ENABLE_APPINTENTS_METADATA' => 'NO'
  }
  s.user_target_xcconfig = {
#    'EXCLUDED_ARCHS[sdk=iphonesimulator*]' => 'x86_64 armv7 arm64',
    'EXCLUDED_ARCHS[sdk=iphonesimulator*]' => 'x86_64',
    'VALID_ARCHS' => 'x86_64 armv7 arm64',
  }

  # Common Subspec
  s.subspec 'Common' do |common|
    common.source_files = 'IMQASDK/IMQACommon/**/*.{swift}'
  end

  # DeviceInfo Subspec
  s.subspec 'DeviceInfo' do |device|
    device.source_files = 'IMQASDK/IMQADeviceInfo/**/*.{h,m}'
    device.public_header_files = 'IMQASDK/IMQADeviceInfo/**/*.h'
    device.dependency 'IMQACore/Common'

  end

  # Internal Utils Subspec
  s.subspec 'ObjCUtilsInternal' do |utils|
    utils.source_files = 'IMQASDK/IMQAObjCUtilsInternal/**/*.{h,m}'
    utils.public_header_files = 'IMQASDK/IMQAObjCUtilsInternal/**/*.h'
  end

  # Core Subspec (depends on all other subspecs)
  s.subspec 'Core' do |core|
    core.source_files = 'IMQASDK/IMQACore/**/*.{swift}'
    core.resource_bundles = {
      'IMQACoreResources' => [
        'IMQASDK/IMQACore/PrivacyInfo.xcprivacy'
      ]
    }
    core.dependency 'IMQACore/Common'
    core.dependency 'IMQACore/DeviceInfo'
    core.dependency 'IMQACore/ObjCUtilsInternal'
    core.dependency 'KSCrash', '2.0.0'
    core.dependency 'SwiftProtobuf', '1.29.0'
  end



end

```

## 验证pod

```bash
  #SDK 代码已经 push 到 Git
  git tag 1.0.0
  git push origin 1.0.0
  
  #.podspec 能 lint 通过（必须）
  pod lib lint IMQACore.podspec --verbose --allow-warnings
  
  #创建私有 Specs Repo
  pod repo add imqa-specs https://github.com/yourorg/imqa-specs.git
  #推送 Podspec 到私有仓库
  pod repo push imqa-specs IMQACore.podspec --allow-warnings --verbose
  
  #主工程使用
  source 'https://github.com/yourorg/imqa-specs.git'
  source 'https://github.com/CocoaPods/Specs.git'
  pod 'IMQACore'
    
  #发布podspec
  #第一步注册邮箱
  pod trunk register your@email.com "Your Name"
  
  #验证 podspec
  pod trunk me
  
  #上传
  pod trunk push IMQACore.podspec --allow-warnings
  
```
