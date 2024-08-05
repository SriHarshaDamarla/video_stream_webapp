package com.wave;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.context.MessageSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.support.ResourceBundleMessageSource;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.spring6.SpringTemplateEngine;
import org.thymeleaf.spring6.templateresolver.SpringResourceTemplateResolver;

@Configuration
public class CoreConfig implements WebMvcConfigurer {

    private ApplicationContext context;

    @Autowired
    public void setContext(ApplicationContext context) {
        this.context = context;
    }

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        registry.addViewController("/movies").setViewName("movies");
        registry.addViewController("/series").setViewName("series");
    }
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/commonStyles/**").addResourceLocations("classpath:/commonStyles/");
        registry.addResourceHandler("/commonJS/**").addResourceLocations("classpath:/commonJS/");
    }
    @Bean
    public ResourceBundleMessageSource messageSource() {
        ResourceBundleMessageSource messageSource = new ResourceBundleMessageSource();
        messageSource.setBasename("messages");
        return messageSource;
    }
    @Bean
    public TemplateEngine thymeleafTemplateEngine(TemplateEngine templateEngine, MessageSource messageSource) {
        SpringResourceTemplateResolver templateResolver = new SpringResourceTemplateResolver();
        templateResolver.setPrefix("classpath:/pages/");
        templateResolver.setApplicationContext(this.context);
        templateResolver.setSuffix(".html");
        templateEngine.addTemplateResolver(templateResolver);
        if(templateEngine instanceof SpringTemplateEngine ste) {
            ste.setTemplateEngineMessageSource(messageSource);
        }
        return templateEngine;
    }
}
