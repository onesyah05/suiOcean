@echo off

REM MEMULAI
IF EXIST node_modules (
    REM Sudah di install Mulai jalankan
    node app.js
) ELSE (
    REM Proses Instalasi
    npm install
    REM Mulai Jalankan
    node app.js
)