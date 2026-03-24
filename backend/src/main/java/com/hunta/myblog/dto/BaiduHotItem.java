package com.hunta.myblog.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BaiduHotItem {
    private int rank;
    private String word;
    private String url;
    private boolean isTop;
    private String hotTag;     // 0=normal, 1=新, 2=暖, 3=热, 4=沸, ""=top
}
