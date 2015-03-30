package com.renovator.pojo;

/**
 * Created by darlingtld on 2015/2/20.
 */

/**
 * 按钮的基类
 */
public class Button {
    public static final String TYPE_CLICK = "click";
    public static final String TYPE_VIEW = "view";
    private String name;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
