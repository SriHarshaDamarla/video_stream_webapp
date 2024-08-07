package com.wave.constants;

public class Languages {
    public static String languageDisplayName(String shortCode){
        return switch (shortCode) {
          case "eng" -> "English";
          case "tel" -> "Telugu";
          case "tam" -> "Tamil";
          case "hin" -> "Hindi";
          case "kan" -> "Kannada";
          case "mal" -> "Malayalam";
          default -> "Unknown";
        };
    }
}
