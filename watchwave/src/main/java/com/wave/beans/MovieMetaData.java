package com.wave.beans;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
public class MovieMetaData {
    private String title;
    private String resolutionName;
    private String folderId;
    private boolean subtitlesAvailable;
    private List<String> subtitles;
    private List<String> languages;
}
