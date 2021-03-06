package com.renovator.controller;

import com.renovator.pojo.User;
import com.renovator.service.UserService;
import com.renovator.util.PropertyHolder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Scope;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.UnsupportedEncodingException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.List;

/**
 * Created by darlingtld on 2015/4/4.
 */
@Scope("prototype")
@Controller
@RequestMapping("/user")
public class UserController {

    private static final Logger logger = LoggerFactory.getLogger(UserController.class);
    @Autowired
    private UserService userService;

    @RequestMapping(value = "list", method = RequestMethod.GET)
    public
    @ResponseBody
    List<User> getUserList(HttpServletRequest request, HttpServletResponse response) {
        return userService.getUserList();
    }

    @RequestMapping(value = "{id}", method = RequestMethod.GET)
    public
    @ResponseBody
    User getUserList(@PathVariable("id") int userId, HttpServletRequest request, HttpServletResponse response) {
        return userService.getUser(userId);
    }

    @RequestMapping(value = "add", method = RequestMethod.POST, headers = "Content-Type=application/json")
    public void addUser(@RequestBody User user, HttpServletRequest request, HttpServletResponse response) {
        userService.addUser(user);
    }

    @RequestMapping(value = "update", method = RequestMethod.POST, headers = "Content-Type=application/json")
    public void updateUser(@RequestBody User user, HttpServletRequest request, HttpServletResponse response) {
        userService.updateUser(user);
    }

    @RequestMapping(value = "delete", method = RequestMethod.POST)
    public void deleteUser(@RequestParam("id") int userId, HttpServletRequest request, HttpServletResponse response) {
        userService.deleteUser(userId);
    }

    @RequestMapping(value = "search", method = RequestMethod.GET)
    public
    @ResponseBody
    List<User> getUserList(@RequestParam("name") String name, @RequestParam("mobile") String contact,
                           @RequestParam("address") String address, @RequestParam("birthday") String birthday,
                           @RequestParam("balance") String balance, HttpServletRequest request, HttpServletResponse response) {
        try {
            return userService.searchUsers(name, contact, address, birthday, balance);
        } catch (ParseException e) {
            e.printStackTrace();
            response.setStatus(HttpStatus.EXPECTATION_FAILED.value());
            response.setHeader(PropertyHolder.HEADER_MSG, e.getMessage());
            return null;
        }
    }

    @RequestMapping(value = "account/bind", method = RequestMethod.POST)
    public
    @ResponseBody
    String bindAccount(@RequestParam("username") String username, @RequestParam("mobile") String contact,
                       @RequestParam("email") String email, @RequestParam("openId") String openId, HttpServletRequest request, HttpServletResponse response) throws UnsupportedEncodingException {
        logger.info("username {}, mobile {}, email {}, openId {}", username, contact, email, openId);
        try {
            userService.bindAccount(username, contact, email, openId);
        } catch (Exception e) {
            e.printStackTrace();
            response.setHeader(PropertyHolder.HEADER_MSG, e.getMessage());
            response.setStatus(HttpStatus.CONFLICT.value());
            return e.getMessage();
        }

        return null;
    }

    @RequestMapping(value = "account/birthday", method = RequestMethod.POST)
    public
    @ResponseBody
    boolean bindAccount(@RequestParam("birthday") String birthday, @RequestParam("openId") String openId, HttpServletRequest request, HttpServletResponse response) {
        logger.info("openId {}, birthday {}", openId, birthday);
        try {
            User user = userService.getUserWithOpenId(openId);
            user.setBirthday(new SimpleDateFormat("yyyy-MM-dd").parse(birthday));
            userService.updateUser(user);
        } catch (Exception e) {
            e.printStackTrace();
            response.setHeader(PropertyHolder.HEADER_MSG, e.getMessage());
            response.setStatus(HttpStatus.CONFLICT.value());
            return false;
        }

        return true;
    }


}
