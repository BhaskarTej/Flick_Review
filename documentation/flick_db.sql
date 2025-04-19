-- updated schema
DROP DATABASE IF EXISTS flickreview;
CREATE DATABASE flickreview;

USE flickreview;

CREATE TABLE users (
    username VARCHAR(45) PRIMARY KEY,
    firebase_uid VARCHAR(255),
    firstName VARCHAR(45),
    lastName VARCHAR(45),
    dob DATE,
    role VARCHAR(20) DEFAULT 'user',
    created_at TIMESTAMP 
        DEFAULT CURRENT_TIMESTAMP,
    lastLogin TIMESTAMP 
        DEFAULT CURRENT_TIMESTAMP 
        ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE reviews (
    reviewId INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(45),
    movieID INT NOT NULL,  -- TMDb Movie ID (Not a foreign key)
    text TEXT,
    rating INT,
    dateCreated TIMESTAMP 
        DEFAULT CURRENT_TIMESTAMP,
    dateModified TIMESTAMP 
        DEFAULT CURRENT_TIMESTAMP 
        ON UPDATE CURRENT_TIMESTAMP,
    isHidden BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (username) REFERENCES users(username) 
        ON DELETE CASCADE
);

CREATE TABLE likes (
    likeId INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(45) NOT NULL,
    reviewId INT NOT NULL,
    type ENUM('like', 'dislike') NOT NULL,
    dateLiked DATETIME NOT NULL 
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (username) REFERENCES users(username) 
        ON DELETE CASCADE,
    FOREIGN KEY (reviewId) REFERENCES reviews(reviewId) 
        ON DELETE CASCADE,
    UNIQUE (username, reviewId)  -- Prevents duplicate likes from the same user on the same review
);

CREATE TABLE moderator_actions (
    actionId INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    adminUsername VARCHAR(45) NOT NULL,
    actionType VARCHAR(50) NOT NULL,   
    actionTimestamp DATETIME NOT NULL 
        DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (adminUsername) REFERENCES users(username) 
        ON DELETE CASCADE
);

CREATE TABLE reported_reviews ( 
    reportId INT AUTO_INCREMENT PRIMARY KEY,
    reporterUsername VARCHAR(45) NOT NULL,
    targetReviewId INT NOT NULL,
    reportReason TEXT NOT NULL,
    reportTimestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reportStatus ENUM('Pending', 'Reviewed', 'Dismissed') NOT NULL DEFAULT 'Pending',
    adminActionId INT NULL,  
    FOREIGN KEY (reporterUsername) REFERENCES users(username) 
        ON DELETE CASCADE,
    FOREIGN KEY (targetReviewId) REFERENCES reviews(reviewId) 
        ON DELETE CASCADE,
    FOREIGN KEY (adminActionId) REFERENCES moderator_actions(actionId)
        ON DELETE SET NULL,
    UNIQUE (reporterUsername, targetReviewId) 
);
