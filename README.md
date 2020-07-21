# Heroku External Objects Demo

## Overview

This project populates a Heroku Postgres database with demo data. Once populated with data, you can then use Heroku Connect to share this data via a Heroku External Object to Salesforce.

## Quick Setup

1. Click the following button to create your own Heroku resources.

[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)

2. Open the app and ensure that all database tables are initialized. (WORK-IN-PROGRESS)

3. Click Heroku Connect, setup a connect, click External Objects, generate credentials, and select all databases.

4. Click Show Credentials, then use these credentials to setup Salesforce External Objects.

## Local Setup

1. Make sure you have [Node.js](http://nodejs.org/) and the [Heroku CLI](https://cli.heroku.com/) installed.

2. Clone this repo...

```sh
$ git clone https://github.com/gabesumner/heroku-external-objects.git
$ cd heroku-external-objects
```

3. Get your Heroku resources...

```sh
$ heroku create
$ git push heroku master
```

4. Setup an environment variable that points to your new Heroku Postgres database.

```sh
export DATABASE_URL=$(heroku config:get DATABASE_URL -a your-heroku-app-name)
```

5. Run your app.

```sh
npm start
```
