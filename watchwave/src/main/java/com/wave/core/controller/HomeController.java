package com.wave.core.controller;

import com.wave.beans.MovieMetaData;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.stream.Collectors;

@Controller
public class HomeController {

    @Value("${stream.location}")
    private String defaultStreamLocation;

    @RequestMapping("/")
    public String homePage(Model model){
        List<MovieMetaData> movieList;
        Path defaultPath = Path.of(defaultStreamLocation);
        try{
            movieList = Files.list(defaultPath).filter(p -> p.toFile().isDirectory()).map(p -> {
                MovieMetaData movie = new MovieMetaData();
                movie.setFolderId(p.toFile().getName());
                System.out.println(p);
                Path titlePath = Path.of(p+"/title.txt");
                try{
                    String name = Files.readAllLines(titlePath).get(0);
                    System.out.println("Movie Name: "+name);
                    movie.setTitle(name);
                    movie.setResolutionName("FHD");
                } catch (IOException e){
                    e.printStackTrace();
                }
                return movie;
            }).collect(Collectors.toList());
            model.addAttribute("movieList", movieList);
        } catch (IOException e){
            e.printStackTrace();
        }

        return "home";
    }
}
