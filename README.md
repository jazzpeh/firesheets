# Firesheets

This package makes it easy use to maintain your firebase database (Firestore) using Google Sheets via CLI.

## Table of Contents

1. [Installation](#installation)
2. [CLI Commands](#cli-commands)
3. [Release Notes](#release-notes)
4. [More Information](#more-information)
    * [Small Print](#small-print)
5. [License](#license)

## Installation

<a name="installation"></a>

Installing Build Tools as a global module will give you command-line access to all tasks available.

You can install globally by typing the following in your terminal:

```bash
npm install firesheets  -g
```

To verified that it is successfully installed, run this:

```bash
firesheets --version
```

## CLI Commands

<a name="cli-commands"></a>

You can use this command to import data from your `Google Sheet` and export to `Firebase`:

```bash
firesheets --args=<values>
```

Arguments allowed are:

| Argument | Type | Description |
|--------|--------|--------|
| `sheet.id` | String | Sheet ID of your `Google Sheet`.
| `sheet.cred` | String | Full path to your `Google Credential`. You will need to enable your `Google Sheets API`. Check out [here](https://developers.google.com/sheets/api/quickstart/nodejs) on a quick way to enable it.
| `db.name`| String | Name of your `Firestore` database.
| `db.cred`| String | Full path to your `Firebase Credential`. Check out [here](https://firebase.google.com/docs/admin/setup) for more information on how to generate a private key file for your service account.

Example usage of arguments:

```bash
firesheets --sheet.id 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms --sheet.cred /Users/john/.google/credentials.json --db.name firesheets-9e63f --db.cred /Users/john/.firebase/firesheets-9e63f-firebase-adminsdk-abcdef-ghi.json
```

## Release Notes

<a name="release-notes"></a>

Please refer to the [Github releases section for the changelog](https://github.com/jazzpeh/firesheets/releases)

## More Information

<a name="more-information"></a>

### Small Print

<a name="small-print"></a>

Author: Jazz Peh &lt;jazzpeh@gmail.com&gt; &copy; 2020

* [@jazzpeh](https://twitter.com/jazzpeh)

License: MIT - do anything with the code, but don't blame me if it does not work.

Support: if you find any problems with this module, email / tweet /
[open issue](https://github.com/jazzpeh/firesheets/issues) on Github

## MIT License

<a name="license"></a>

Copyright (c) 2020 Jazz Peh (twitter: [@jazzpeh](https://twitter.com/jazzpeh))
Licensed under the MIT license.
