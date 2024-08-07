package com.wave.core.controller;

import com.wave.beans.MovieMetaData;
import com.wave.constants.Languages;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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
                Path titlePath = Path.of(p+"/metadata.txt");
                try{
                    List<String> lines = Files.readAllLines(titlePath);
                    Map<String,String> metadata = getMetaDataMap(lines);
                    String[] languages = metadata.get("languages").split(",");
                    List<String> languageList = Arrays.stream(languages).map(Languages::languageDisplayName).collect(Collectors.toList());
                    movie.setTitle(metadata.get("title"));
                    movie.setResolutionName(metadata.get("maxResolution"));
                    movie.setLanguages(languageList);
                    if(metadata.containsKey("subtitles") && !metadata.get("subtitles").equalsIgnoreCase("none")){
                        String[] subtitles = metadata.get("subtitles").split(",");
                        List<String> subtitleList = Arrays.stream(subtitles).map(Languages::languageDisplayName).collect(Collectors.toList());
                        movie.setSubtitles(subtitleList);
                        movie.setSubtitlesAvailable(true);
                    }
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

    private static Map<String,String> getMetaDataMap(List<String> lines){
        var result = new HashMap<String,String>();
        result = lines.stream().map(s -> s.split("=")).reduce(result,
                (map,arr) -> {
            map.put(arr[0],arr[1]);
            return map;
        },
                (map1, map2) -> {
            if(map1 != null && map1.equals(map2)){
                return map1;
            }
            return map2;
        });
        return result;
    }
}
