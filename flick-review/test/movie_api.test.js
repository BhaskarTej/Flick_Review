const request = require('supertest');
const app = require('../server');
const axios = require('axios');
const db = require('../config/db');

jest.mock('axios');

describe("GET /movie/:id", () => {
    beforeAll(() => {
        process.env.NODE_ENV = 'test';
    });

    it("should return movie details and reviews as JSON", async () => {
        const mockMovieResponse = {
            data: {
                id: 1234,
                title: 'Fake Movie',
                overview: 'A fake movie for testing',
                release_date: '2025-01-01'
            }
        };

        const mockReviews = [
            { reviewId: 1, username: "testuser", text: "Nice!", rating: 4 }
        ];

        axios.get.mockResolvedValue(mockMovieResponse);

        jest.spyOn(db, 'query').mockImplementation((sql, values, callback) => {
            if (sql.includes("FROM reviews")) {
                callback(null, mockReviews);
            }
        });

        const response = await request(app).get(`/movie/1234`);

        expect(response.status).toBe(200);
        expect(response.body.movie.title).toBe("Fake Movie");
        expect(response.body.reviews[0].text).toBe("Nice!");
        expect(axios.get).toHaveBeenCalledWith(
            `https://api.themoviedb.org/3/movie/1234`,
            expect.objectContaining({
              params: { api_key: process.env.API_KEY }
            })
        );
    });
});
