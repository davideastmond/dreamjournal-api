# Dream Journal API

## About

This is the API part of my app that allows users to log their dreams.

The front-end repo can be found at https://github.com/davideastmond/dreamjournal-web

## Tech Stack

Typescript, MongoDB, express, Jest

## Dev Environment

1. Clone the repo and run `npm i` to install dependences
2. Create a `.env` at the root of the repo.
3. You can use a local or a cloud instance of MongoDB. Populate `DEV_MONGO_URI` with the appropriate connection string
4. Create a dev api key and populate `DEV_API_KEY` with it.
5. Create a secret string and populate `DEV_JSON_SECRET` with it.
6. For testing, create a token string and populate `INVALID_TEST_TOKEN` with it.