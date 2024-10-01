package com.wave.core.filter;

import com.wave.core.util.AuthValidator;
import jakarta.servlet.*;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Arrays;
import java.util.Enumeration;
import java.util.Random;

@Component
public class AuthorizationFilter implements Filter {

    private AuthValidator authValidator;

    @Autowired
    public void setAuthValidator(AuthValidator authValidator) {
        this.authValidator = authValidator;
    }

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
        HttpServletRequest request = (HttpServletRequest) servletRequest;
        HttpServletResponse response = (HttpServletResponse) servletResponse;
        if(request.getRequestURI().contains("filterError") ||
           request.getRequestURI().contains("commonJS") ||
           request.getRequestURI().contains("commonStyles") ||
           request.getRequestURI().contains("favicon") ||
           request.getRequestURI().contains("refreshIds")
        ){
            filterChain.doFilter(request, response);
            return;
        }
        Enumeration<String> headerNames = request.getHeaderNames();
        System.out.println("------Printing header details-----");
        while(headerNames.hasMoreElements()){
            String headerName = headerNames.nextElement();
            System.out.println(headerName+" : "+request.getHeader(headerName));
        }
        HttpSession session = request.getSession(false);
        if(session != null && session.getAttribute("otp") != null){
            String otp = session.getAttribute("otp").toString();
            if(authValidator.validateId(otp)){
                Cookie cookie = new Cookie("otp", otp);
                cookie.setPath("/");
                cookie.setMaxAge(24*60*60);
                response.addCookie(cookie);
                filterChain.doFilter(request, response);
                return;
            } else {
                Cookie cookie = new Cookie("JSESSIONID", "");
                cookie.setPath("/");
                cookie.setMaxAge(0);
                response.addCookie(cookie);
                session.invalidate();
            }
        }
        System.out.println("Url : " + request.getRequestURI());
        Cookie[] cookies = request.getCookies();
        System.out.println("Printing Cookie Details: ");
        StringBuilder authVal = new StringBuilder();
        if(cookies != null) {
            Arrays.stream(cookies).forEach(cookie -> {
                if(cookie.getName().equals("otp")){
                    if(authValidator.validateId(cookie.getValue())){
                        HttpSession newSession = request.getSession(true);
                        newSession.setAttribute("otp", cookie.getValue());
                        newSession.setMaxInactiveInterval(24*60*60);
                        authVal.append("Authenticated");
                    }
                }
                System.out.println(cookie.getName() + " : " + cookie.getValue());
            });
        }
        if(authVal.isEmpty()){
            Random rand = new Random();
            int oneTimeValue = rand.nextInt(10000);
            while(authValidator.validateId( Integer.toString(oneTimeValue)) ) {
                oneTimeValue = rand.nextInt(10000);
            }
            Cookie cookie = new Cookie("otp", oneTimeValue + "");
            cookie.setPath("/");
            cookie.setMaxAge(3600);
            response.addCookie(cookie);
            request.setAttribute("errMsg",cookie.getValue());
            request.getRequestDispatcher("/filterError").forward(request, response);
            return;
        }
        filterChain.doFilter(request, response);
    }
}
