CREATE DATABASE IF NOT EXISTS bbk7wdvxp9dio51zhmq6;

USE bbk7wdvxp9dio51zhmq6;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    password VARCHAR(100),
    salt  VARCHAR(255),
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS vaults (
    vault_id INT AUTO_INCREMENT,
    user_id INT,
    vault_name VARCHAR(100),
    PRIMARY KEY (vault_id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS entries (
    entry_id INT AUTO_INCREMENT,
    vault_id INT,
    website VARCHAR(100),
    username VARCHAR(100),
    password VARCHAR(100),
    salt  VARCHAR(255),
    iv VARCHAR(255),
    PRIMARY KEY (entry_id),
    FOREIGN KEY (vault_id) REFERENCES vaults(vault_id)
);