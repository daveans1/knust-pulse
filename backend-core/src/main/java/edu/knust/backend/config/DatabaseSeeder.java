package edu.knust.backend.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import edu.knust.backend.repository.UserRepository;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.util.FileCopyUtils;

import java.nio.charset.StandardCharsets;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository users;
    private final JdbcTemplate jdbc;

    public DatabaseSeeder(UserRepository users, JdbcTemplate jdbc) {
        this.users = users;
        this.jdbc = jdbc;
    }

    @Override
    public void run(String... args) throws Exception {
        if (users.count() == 0) {
            System.out.println("Database is empty! Running seed script...");
            try {
                ClassPathResource resource = new ClassPathResource("02_social_features.sql");
                byte[] binaryData = FileCopyUtils.copyToByteArray(resource.getInputStream());
                String sql = new String(binaryData, StandardCharsets.UTF_8);
                jdbc.execute(sql);
                System.out.println("Database seeded successfully!");
            } catch (Exception e) {
                System.err.println("Failed to seed database: " + e.getMessage());
            }
        } else {
            System.out.println("Database already contains data. Skipping seed.");
        }
    }
}
