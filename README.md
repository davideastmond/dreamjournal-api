# Dream Journal API

## About

This is the API part of my app that allows users to log their dreams.

The front-end repo can be found at https://github.com/davideastmond/dreamjournal-web

## Notable features
- Aside from supporting crud operations, this API supports emailing and password recovery functionality.

## Tech Stack

Typescript, MongoDB, express, Jest

## Dev Environment

1. Clone the repo and run `npm i` to install dependences
2. Create a `.env` at the root of the repo.
3. You can use a local or a cloud instance of MongoDB. Populate `DEV_MONGO_URI` with the appropriate connection string
4. Create a dev api key and populate `DEV_API_KEY` with it. This string is sent in the request authorization headers from the front-end requests and should match.
5. Create a secret string and populate `DEV_JSON_SECRET` with it.
6. For testing, create a token string and populate `INVALID_TEST_TOKEN` with it.

7. Run `npm run dev` to start the development server.

## Tests
Run `npm t` to run the test suite