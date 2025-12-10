-- Create database if not exists
CREATE DATABASE IF NOT EXISTS imageviewer;
USE imageviewer;

-- Create images table
CREATE TABLE IF NOT EXISTS images (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    url VARCHAR(500) NOT NULL,
    category TEXT,
    remark TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert sample data (optional)
-- INSERT INTO images (id, name, url, category, remark) VALUES 
-- ('sample-1', 'Sample Image 1', '/uploads/sample1.jpg', 'This is a sample image'),
-- ('sample-2', 'Sample Image 2', '/uploads/sample2.jpg', 'This is another sample image');