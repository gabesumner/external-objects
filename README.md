# Heroku External Objects Demo

## Overview

This project populates a Heroku Postgres database with demo data. You can then use Heroku Connect to share this data via a Heroku External Object to Salesforce using Salesforce Connect.

## Quick Setup

1. Click the following button to deploy your own clone of this demo.

[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)

2. After the app is deployed, click the **Manage App** button.

3. Click Heroku Connect, Setup Connection, select the existing Postgres database, click Next, then Skip the Authorization.

4. Inside Heroku Connect, click External Objects, Create Credentials, then select all the Data Sources.

5. Click Show Credentials, then use these credentials to setup [Salesforce Connect](https://trailhead.salesforce.com/content/learn/projects/quickstart-lightning-connect/quickstart-lightning-connect2).

To RESET the demo data, click the **Open app** button from your Heroku app and click **RESET**.

## Local Setup

1. Make sure you have [Node.js](http://nodejs.org/) and the [Heroku CLI](https://cli.heroku.com/) installed.

2. Clone this repo...

```sh
$ git clone https://github.com/gabesumner/heroku-external-objects.git
$ cd heroku-external-objects
```

3. Fetch the NPM libraries...

```sh
$ yarn install
```

4. Create your Heroku resources...

```sh
$ heroku create
$ heroku addons:create heroku-postgresql:hobby-dev
$ heroku addons:create herokuconnect
```

-   Make note of the name assigned to your Heroku app. \*

5. Setup an environment variable that points to your new Heroku Postgres database.

```sh
export DATABASE_URL=$(heroku config:get DATABASE_URL -a your-heroku-app-name)
```

5. Run your app.

```sh
yarn watch
```

6. Access the website from your web browser. Your Postgress database tables are now populated. Refer to the instructions above to setup Heroku Connect and Salesforce Connect.
