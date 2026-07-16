<?php

require_once __DIR__ . '/Database.php';

class User
{
    private PDO $db;

    public function __construct(Database $database)
    {
        $this->db = $database->getConnection();
    }

    public function authenticate(string $username, string $password): ?array
    {
        $stmt = $this->db->prepare('SELECT id, username, password_hash, role FROM users WHERE username = :username LIMIT 1');
        $stmt->execute(['username' => $username]);
        $user = $stmt->fetch();

        if (!$user) {
            return null;
        }

        $hash = $user['password_hash'];
        $isValid = false;

        if (str_starts_with($hash, '$2y$') || str_starts_with($hash, '$2a$') || str_starts_with($hash, '$argon2')) {
            $isValid = password_verify($password, $hash);
        } else {
            $isValid = hash_equals($hash, hash('sha256', $password));
        }

        if ($isValid) {
            return [
                'id' => $user['id'],
                'username' => $user['username'],
                'role' => $user['role'],
            ];
        }

        return null;
    }
}
