-- Financial Freedom Platform Database Schema
-- MySQL schema with DECIMAL types for precise financial calculations

CREATE DATABASE IF NOT EXISTS financial_freedom;
USE financial_freedom;

-- Users table (future-ready for authentication)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Debts table - core debt information
CREATE TABLE debts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    name VARCHAR(255) NOT NULL,
    principal DECIMAL(12,2) NOT NULL CHECK (principal >= 0),
    apr DECIMAL(6,4) NOT NULL CHECK (apr >= 0),
    min_payment DECIMAL(10,2) NOT NULL CHECK (min_payment >= 0),
    payment_frequency ENUM('monthly', 'weekly') DEFAULT 'monthly',
    compounding ENUM('monthly', 'daily', 'none') DEFAULT 'monthly',
    start_date DATE DEFAULT (CURRENT_DATE),
    status ENUM('active', 'paid') DEFAULT 'active',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Payments table - payment history tracking
CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    debt_id INT NOT NULL,
    user_id INT,
    amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
    payment_date DATE NOT NULL,
    source ENUM('scheduled', 'one-off', 'freed') DEFAULT 'scheduled',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (debt_id) REFERENCES debts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Commitments table - extra payment tracking
CREATE TABLE commitments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    strategy ENUM('avalanche', 'snowball', 'hybrid', 'custom') DEFAULT 'avalanche',
    custom_alloc JSON,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Plan snapshots table - scenario comparison
CREATE TABLE plan_snapshots (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    name VARCHAR(255) NOT NULL,
    snapshot_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    json_state JSON NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_debts_user_id ON debts(user_id);
CREATE INDEX idx_debts_status ON debts(status);
CREATE INDEX idx_payments_debt_id ON payments(debt_id);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_date ON payments(payment_date);
CREATE INDEX idx_commitments_user_id ON commitments(user_id);
CREATE INDEX idx_snapshots_user_id ON plan_snapshots(user_id);

-- Insert sample data for testing (optional)
INSERT INTO debts (name, principal, apr, min_payment, payment_frequency, compounding, notes) VALUES
('Credit Card', 15000.00, 18.50, 300.00, 'monthly', 'monthly', 'High interest credit card debt'),
('Car Loan', 45000.00, 8.75, 650.00, 'monthly', 'monthly', 'Vehicle financing'),
('Personal Loan', 25000.00, 12.25, 400.00, 'monthly', 'monthly', 'Bank personal loan'),
('Student Loan', 35000.00, 6.50, 280.00, 'monthly', 'monthly', 'Education debt');
