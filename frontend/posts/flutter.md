---
title: "flutter sdk 制作总结"
date: "2025-12-31"
---

## 常用三方sdk

### 网络与数据处理：‌ 常用SDK包括：
dio‌：强大的HTTP客户端，支持拦截器、超时和缓存。
connectivity‌：检测设备网络连接状态。
json_serializable‌：通过代码生成实现Dart类与JSON的序列化/反序列化。
sqflite‌：轻量级SQLite数据库插件，用于本地数据存储。‌

### ‌状态与依赖管理：‌ 主要SDK有：
flutter_bloc‌：基于BLoC模式的状态管理库。
provider‌：轻量级状态管理，支持BLoC和Provider模式混合使用。
get_it‌：依赖注入工具，简化依赖关系管理。‌

### UI与交互增强：‌ 这类SDK包括：
fluttertoast‌：显示轻量级提示信息（Toast）。
url_launcher‌：打开外部链接（如浏览器、电话）。
image_picker‌：从相册或相机选择图片。
flutter_html‌：渲染HTML内容。
flutter_map‌：地图组件，支持Google Maps等。
chewie‌：视频播放器，基于video_player封装。
flutter_slidable‌：实现滑动删除等交互效果。‌

### ‌设备与系统集成：‌ 常用SDK涵盖：
location‌：获取当前位置和监听位置变化。
device_info‌：获取设备型号、系统版本等信息。
package_info‌：读取应用包信息（如名称、版本）。
shared_preferences‌：存储键值对数据（如用户设置）。
flutter_local_notifications‌：发送本地通知。‌

### ‌支付与登录：‌ 主要SDK包括：

‌支付类‌：如Alipay（支付宝）和fluwx（微信支付）。
‌登录类‌：如sign_in_with_apple（Apple登录）、flutter_facebook_auth（Facebook登录）和fluwx（微信登录）。‌

### ‌工具与实用插件：‌ 其他常用工具包括：

flutter_screenutil‌：提供屏幕适配方案。
permission_handler‌：请求设备权限（如相机、位置）。
qr_flutter‌：生成和扫描二维码。
flutter_swiper‌：实现轮播图功能。‌
