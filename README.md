# Knowing-Narcolepsy-Backend

Backend API for Knowing Narcolepsy.

## Required Environment Variables

Set this before starting the server:

- `MONGODB_URI` - MongoDB Atlas connection string

## Local Run

1. Create a `.env` file in the backend root from `.env.example`.
2. Set `MONGODB_URI` in that file.
3. Start the server with your usual command (`node server.js`).

## Security Note

Do not commit real credentials. If credentials were previously committed, rotate them in MongoDB Atlas and update Render environment variables.
