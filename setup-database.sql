-- Database schema for VotingForm Results
-- Run this after RDS is created

USE sprint_voting;

-- Table for storing voting results
CREATE TABLE IF NOT EXISTS voting_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    selected_items JSON NOT NULL,
    total_hours INT NOT NULL,
    capacity_percentage DECIMAL(5,2) NOT NULL,
    sprint_number INT NOT NULL DEFAULT 24,
    submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    INDEX idx_email (email),
    INDEX idx_sprint (sprint_number),
    INDEX idx_date (submission_date)
);

-- Table for individual question selections
CREATE TABLE IF NOT EXISTS question_selections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    voting_result_id INT NOT NULL,
    question_id VARCHAR(50) NOT NULL,
    question_title VARCHAR(500) NOT NULL,
    estimated_hours INT,
    complexity VARCHAR(50),
    category VARCHAR(100),
    FOREIGN KEY (voting_result_id) REFERENCES voting_results(id) ON DELETE CASCADE,
    INDEX idx_question (question_id),
    INDEX idx_category (category)
);

-- Table for tracking form analytics
CREATE TABLE IF NOT EXISTS form_analytics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL,
    event_data JSON,
    user_email VARCHAR(255),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_event (event_type),
    INDEX idx_timestamp (timestamp)
);

-- View for easy result querying
CREATE OR REPLACE VIEW results_summary AS
SELECT 
    vr.id,
    vr.email,
    vr.total_hours,
    vr.capacity_percentage,
    vr.sprint_number,
    vr.submission_date,
    COUNT(qs.id) as items_selected,
    GROUP_CONCAT(qs.question_title SEPARATOR ', ') as selected_items_list
FROM voting_results vr
LEFT JOIN question_selections qs ON vr.id = qs.voting_result_id
GROUP BY vr.id
ORDER BY vr.submission_date DESC;

-- Insert sample data for testing
INSERT INTO voting_results (email, selected_items, total_hours, capacity_percentage, sprint_number) 
VALUES 
('test@foundever.com', '["question1", "question3"]', 50, 19.23, 24);

-- Show tables created
SHOW TABLES;
SELECT 'Database setup completed successfully!' as status;
