# Contributing to Macropolis

API endpoints
- Method
  - query parameters based
    - GET
    - DELETE
  - form based (using formidable lib)
    - POST

### If you willing to contribute please follow conventions bellow 

Resource | Convention | Example
--- | --- | ---
`Api endpoints names` | Kebab case | sign-up.js
`Pages names` | Kebab case | sign-in.js
`Query parameters` | Camel case | confirmationHash
`Styles classes, ids, etc.` | Camel case | indexContainerButton
`Database collection keys` | Snake case | confirmation_hash
`Database collection names` | Snake case | account_details
`Post parameters` | Camel case | confirmationHash
`Imports` | | import { Module } from 'lib' or import axios from 'axios'"
`Prices` | Stored in dollar cents | price is $1.00 we store 100 as integer in db

Dependencies
- [formidable](https://github.com/node-formidable/formidable) - post form data handling
- [mongodb](https://github.com/mongodb/node-mongodb-native) - database
