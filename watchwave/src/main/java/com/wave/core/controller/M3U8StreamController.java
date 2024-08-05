package com.wave.core.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

@Controller
public class M3U8StreamController {

    @Value("${stream.location}")
    private String defaultStreamLocation;

    @RequestMapping("/load/{folderId}/{fileName}")
    public ResponseEntity<byte[]> getM3U8Stream(@PathVariable String folderId, @PathVariable String fileName) throws IOException {
        Path p = Path.of(defaultStreamLocation, folderId, fileName);
        if(p.toFile().exists()) {
            return ResponseEntity.ok(Files.readAllBytes(p));
        }
        return ResponseEntity.notFound().build();
    }

    @RequestMapping(value ="/play",method= RequestMethod.GET)
    public String playVideo(@RequestParam String movieTitle, Model model) {
        System.out.println("Movie Title: " + movieTitle);
        model.addAttribute("movieTitle", movieTitle);
        return "player";
    }
}
