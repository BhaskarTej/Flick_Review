USE flickreview;

CREATE TABLE users (
    username VARCHAR(45) PRIMARY KEY,
    firstName VARCHAR(45),
    lastName VARCHAR(45),
    dob DATE,
    lastLogin TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    role VARCHAR(20)
);

CREATE TABLE reviews (
    reviewId INT AUTO_INCREMENT PRIMARY KEY,
    text TEXT,
    dateCreated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dateModified TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    rating INT,
    username VARCHAR(45),
    movieID INT NOT NULL,  -- TMDb Movie ID (Not a foreign key)
    FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE
);

SHOW TABLES;