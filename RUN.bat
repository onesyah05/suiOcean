@echo off

REM MEMULAI
IF EXIST node_modules (
    REM Sudah di install Mulai jalankan
    node app.js
    REM Gas
    npm audit fix --force
) ELSE (
    REM Proses Instalasi
    npm install
    REM Mulai Jalankan
    node app.js
)