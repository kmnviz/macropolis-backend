API endpoints
- Method
  - query parameters based
    - GET
    - DELETE
  - form based (using formidable lib)
    - POST

Conventions
- api endpoints names
  - kebab case (e.g. "sign-up.js")
- pages names
  - kebab case (e.g. "sign-in.js")
- query parameters
  - camel case (e.g "confirmationHash")
- styles classes, ids, etc.
  - camel case (e.g. "indexContainerButton")
- database collection keys
  - snake case (e.g. "confirmation_hash")
- database collection names
  - snake case (e.g. "account_details")
- post parameters
  - camel case (e.g. "confirmationHash")
- imports
  - e.g. "import { Module } from 'lib' | import axios from 'axios'"
- prices
  - stored in dollar cents (e.g. price is $1.00 we store 100 as integer in db)

Dependencies
- formidable - post form data handling
- mongodb - database
