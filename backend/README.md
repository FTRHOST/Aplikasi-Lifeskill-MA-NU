# Backend Aplikasi Life Skill

Ini adalah backend untuk aplikasi manajemen Life Skill yang dibuat dengan Node.js, Express, dan MySQL.

## Prasyarat

-   [Node.js](https://nodejs.org/) (versi 16 atau lebih tinggi)
-   [MySQL](https://www.mysql.com/) atau MariaDB

## 1. Setup Database

1.  Masuk ke *shell* MySQL Anda.
2.  Buat database baru untuk aplikasi ini.

    ```sql
    CREATE DATABASE lifeskills_db;
    ```

3.  Gunakan database yang baru dibuat.

    ```sql
    USE lifeskills_db;
    ```

4.  Buat tabel `students` dan `admins` dengan menjalankan skema SQL berikut.

    ```sql
    -- Tabel untuk data siswa
    CREATE TABLE students (
        id VARCHAR(36) PRIMARY KEY,
        fullName VARCHAR(255) NOT NULL,
        classLevel VARCHAR(10) NOT NULL,
        whatsappNumber VARCHAR(20) NOT NULL,
        lifeSkill ENUM('Tata Rias', 'Tata Boga', 'Tata Busana', 'Setir Mobil', 'Desain Grafis', 'Otomotif') NOT NULL,
        jenisKelamin ENUM('Laki-laki', 'Perempuan') NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

    -- Tabel untuk admin (pengguna yang bisa login)
    CREATE TABLE admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    ```

5.  Buat pengguna admin awal. Password `admin123` akan di-hash. Jalankan perintah SQL berikut untuk memasukkan admin default.

    ```sql
    -- Password untuk 'admin' adalah 'admin123'
    -- Hash ini dibuat menggunakan bcrypt dengan salt 10
    INSERT INTO admins (username, password) VALUES ('admin', '$2a$10$fV/F0sq8SoH9a/aA.p2sR.Xq9R3OAxWzYJt.N2uK.ft4V.9dGg.8u');
    ```

## 2. Setup Proyek

1.  Arahkan ke direktori `backend` dari terminal Anda.

    ```bash
    cd backend
    ```

2.  Instal semua dependensi yang dibutuhkan.

    ```bash
    npm install
    ```

3.  Buat file `.env` di dalam direktori `backend` dengan menyalin dari `.env.example`.

    ```bash
    cp .env.example .env
    ```

4.  Ubah file `.env` dan isi dengan kredensial database MySQL Anda.

    ```env
    PORT=5000
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=password_anda
    DB_NAME=lifeskills_db
    JWT_SECRET=kunci_rahasia_jwt_yang_sangat_aman
    ```

## 3. Menjalankan Server

1.  Untuk menjalankan server dalam mode pengembangan (dengan *hot-reload* menggunakan `nodemon`):

    ```bash
    npm run dev
    ```

2.  Untuk menjalankan server dalam mode produksi:
    ```bash
    npm start
    ```

Server akan berjalan di `http://localhost:5000`.

## Endpoints API

-   `POST /api/login`: Login untuk admin.
-   `GET /api/students`: Mendapatkan semua data siswa (memerlukan autentikasi).
-   `POST /api/students`: Menambahkan siswa baru (memerlukan autentikasi).
-   `PUT /api/students/:id`: Memperbarui data siswa (memerlukan autentikasi).
-   `DELETE /api/students/:id`: Menghapus data siswa (memerlukan autentikasi).
