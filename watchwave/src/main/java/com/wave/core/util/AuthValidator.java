package com.wave.core.util;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.context.annotation.ApplicationScope;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

@Component
@ApplicationScope
public class AuthValidator {

    private List<String> validIds = new ArrayList<>();
    @Value("${idList.path}")
    private String ID_PATH;

    @PostConstruct
    public void refreshIdList() {
        try {
            validIds = Files.readAllLines(Path.of(ID_PATH));
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public boolean validateId(String id) {
        return validIds.contains(id);
    }
}
