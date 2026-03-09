package com.iglesia;

public class DatabaseSettings {

    private static DatabaseSettings instance;

    private String url;
    private String username;
    private String password;

    private DatabaseSettings() {
        this.url = "jdbc:postgresql://localhost:5432/iglesia";
        this.username = "postgres";
        this.password = "postgres";
    }

    public static DatabaseSettings getInstance() {
        if (instance == null) {
            instance = new DatabaseSettings();
        }
        return instance;
    }

    public String getUrl() {
        return url;
    }

    public String getUsername() {
        return username;
    }

    public String getPassword() {
        return password;
    }
}