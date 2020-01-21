# Firesheets

This package makes it easy use to maintain your firebase database (Firestore) using Google Sheets.

## Table of Contents

1. [Configuration](#configuration)
    * [Config file](#config-file)
    * [Firebase Credentials](#firebase-credentials)

## Configuration

<a name="configuration"></a>

### Config file

<a name="config-file"></a>

Create a configuration file `development.json` under `config` folder using `default.json` as the template.

### Firebase Credentials

<a name="firebase-credentials"></a>

To set the environment variable for Firebase Admin SDK:

#### For Mac/Linux

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/home/user/Downloads/service-account-file.json"
```

#### For Windows (Using PowerShell)

```bash
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\Users\username\Downloads\service-account-file.json"
```

For more information visit [https://firebase.google.com/docs/admin/setup](https://firebase.google.com/docs/admin/setup)
