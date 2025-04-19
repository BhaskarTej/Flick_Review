const request = require('supertest');
const app = require('../server');
const db = require('../config/db');

//mock the db.query method to simulate a MySQL query result
jest.mock('../config/db')

describe('GET /movie/:id', () => {
    
    it('should return reviews for the movie', async () => {
        const mockReviews = [
            {
                reviewId: 1,
                username: 'testUser',
                movieID: 123,
                text: 'Great movie!',
                rating: 5,
                dateCreated: '2025-03-25 12:00:00',
                dateModified: '2025-03-25 12:00:00',
            },
        ];

        //mock db.query to return the reviews
        db.query.mockImplementation((query, params, callback) => {
            callback(null, mockReviews);
        });

        const response = await request(app).get('/movie/123');

        //assertions
        expect(response.status).toBe(200);
        expect(response.text).toContain('Great movie!');
        expect(db.query).toHaveBeenCalledWith(
            "SELECT * FROM reviews WHERE movieID = ?",
            ['123'],
            expect.any(Function)
        );
    });
});
