package com.hunta.myblog.controller;

import com.hunta.myblog.common.ApiResponse;
import com.hunta.myblog.dto.BaiduHotItem;
import com.hunta.myblog.service.BaiduHotService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/baidu-hot")
@RequiredArgsConstructor
public class BaiduHotController {

    private final BaiduHotService baiduHotService;

    /**
     * GET /baidu-hot?tab=realtime
     * tabs: realtime(热搜榜), civil(民生榜), finance(财经榜)
     */
    @GetMapping
    public ApiResponse<List<BaiduHotItem>> getHotList(
            @RequestParam(defaultValue = "realtime") String tab
    ) {
        return ApiResponse.success(baiduHotService.getHotList(tab));
    }

    @GetMapping("/tabs")
    public ApiResponse<List<String>> getTabs() {
        return ApiResponse.success(baiduHotService.getTabs());
    }
}
