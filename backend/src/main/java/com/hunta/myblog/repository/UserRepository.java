package com.hunta.myblog.repository;
import com.hunta.myblog.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);

    boolean existsByUsername(String username);

    Optional<User> findByUsernameIgnoreCase(String username);

    Optional<User> findByUsernameAndPassword(String username, String password);

    List<User> findByUsernameContaining(String keyword);
}
