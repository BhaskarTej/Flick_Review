USE flickreview;

INSERT INTO users (username, firstName, lastName, dob, role) 
VALUES 
    ('john_doe', 'John', 'Doe', '1990-05-15', 'user'),
    ('admin_user', 'Alice', 'Smith', '1985-10-22', 'admin');

INSERT INTO reviews (username, movieID, text, rating) 
VALUES 
    ('john_doe', 101, 'recommended.', 9),
    ('admin_user', 202, 'Not good but decent.', 6);

INSERT INTO likes (username, reviewId) 
VALUES 
    ('john_doe', 1), 
    ('admin_user', 2);

INSERT INTO admin_actions (adminUsername, targetUsername, targetReviewId, actionType, details) 
VALUES 
    ('admin_user', 'john_doe', 1, 'Review', 'nsfw'), 
    ('admin_user', 'john_doe', NULL, 'Deletion', 'deleted nsfw');
