# Flick Review 

 FlickReview is an online platform designed for movie lovers to share and explore reviews.

## Software Stack:
- Frontend: EJS and CSS
- Backend: Node.js and Express.js
- Data: MySQL and Firebase
- Communication: TMDB API and Express Middleware

## Features:
- Account Creation & Login
- Movie Search
- Movie Browsing
- Genre-Based Filtering
- Review System
- Moderation System
- Profile Customization (in-progress)

## To run

- Clone github

    ```git clone https://github.com/BhaskarTej/Flick_Review.git```

- Download node.js

    ```https://nodejs.org/en/download```


- Install modules

    ```npm install express```

    Packages Used
    - express: Web Framework
    - express-session - Manages session-based authentication
    - firebase - used for authentication features
    - firebase-admin - Handles server-side firebase operations
    - dotenv - Loads enviroment variables from .env file
    - axios - Facilitates API requests
    - mysql2 - Optimized for mysql performance

- Create firebase project and enable authentication
    - sign-in method email/password
    - register app in firebase settings

- Download mysql

    ```https://dev.mysql.com/downloads/installer/```

    - run script ```/documentation/flick_db.sql```

- Fill out ```.env``` file with the necessary credentials 
- Run 
    ```npm start```

- Server runs on ```http://localhost:3022```

## Possible Improvements
- Error handling
- Form styling
- Queries Optimization
- Movie Suggestions
- Refactoring and Routing
