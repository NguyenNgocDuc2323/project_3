-- Create Contacts table
CREATE TABLE IF NOT EXISTS Contacts (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Email VARCHAR(255) NOT NULL,
    Phone VARCHAR(20),
    Subject VARCHAR(100) NOT NULL,
    Message VARCHAR(5000) NOT NULL,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    IsResolved BOOLEAN DEFAULT FALSE,
    AdminResponse VARCHAR(500) DEFAULT '',
    CHARSET=utf8mb4
);

-- Create index on Email for faster queries
CREATE INDEX IX_Contacts_Email ON Contacts(Email);

-- Create index on CreatedAt for sorting
CREATE INDEX IX_Contacts_CreatedAt ON Contacts(CreatedAt DESC);
