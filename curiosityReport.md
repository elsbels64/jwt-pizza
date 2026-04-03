# Curiosity Report: Integration Testing with GitHub Actions

## Overview

Professor Jensen talked a lot about the importance of integration testing. With all this talk about how useful it is, I thought it was a bummer that I never got the chance to implement it. I also thought this would be a really useful curiosity project because I felt like mocking caused so many extra problems that it made it kind of difficult to actually test the code. A lot of the time, my tests would fail just because I messed up the mocking somewhere.

## What is Integration Testing?

Integration testing is the level of testing just above unit testing. Rather than testing whether a single component or module works, it tests multiple components or modules together to see if there are any issues in how they interact.

## Why Use Integration Testing?

Integration testing is important because it identifies issues in compatibility or communication between different components. It also runs faster and is less expensive than end-to-end tests. You may have two different components that work perfectly on their own, but they may not communicate properly with each other. This can be caused by issues like:

- **Inconsistent code logic** — The front end is sending to `/menu/pizza/pepperoni` and the backend is expecting `/menu/pizzas/pepperoni` (every order silently 404s).
- **Inconsistent data rules** — The frontend lets customers type a name up to 20 characters, but the database column is `VARCHAR(10)` (long names get rejected with a cryptic DB error instead of a helpful message).
- **Conflicts with third-party services** — The app sends a payment to a third party using a customer ID it stored months ago, but the third party deleted that test customer (every checkout fails in production but passes in local testing, where the ID was freshly created).
- **Inadequate exception handling** — The backend returns `{ error: "Out of stock" }` with a 400 status when an item isn't available, but the frontend only checks for a 200 and tries to read `response.data.order.id` (the page crashes instead of showing the user a friendly message).

### Pros and Cons of Integration Testing

**Pros:**
- Catches communication bugs that unit tests miss
- Faster and cheaper than end-to-end tests
- Easier to debug than end-to-end tests

**Cons:**
- More difficult to debug than unit testing
- More expensive and time-consuming than unit testing
- Harder to set up in CI and dev environments than unit testing
- Less realistic than end-to-end tests

## What Are the Different Ways to Implement Integration Testing?

There are four different approaches to integration testing: you can test everything all at once, work from the bottom up, work from the top down, or use a mixed approach.

### Big-Bang Integration Testing

All modules are combined and tested together.

**Pros:**
- Simple to plan and implement for smaller systems or systems that don't have a lot of interdependency between modules
- Can be implemented quickly

**Cons:**
- Very difficult to identify where a bug is coming from in larger systems
- Doesn't prioritize higher-risk modules
- Can't be used for highly interdependent systems

### Bottom-Up Integration Testing

Start by testing modules at lower levels, then test them with modules at higher levels until everything is tested.

**Pros:**
- Unconnected subsystems can be tested at the same time
- Good for models that were implemented with a bottom-up design
- Easier to tell where a bug is coming from

**Cons:**
- Less useful if the high-level design is uncertain or likely to change
- Requires "driver" modules (stubs that simulate higher-level callers), which adds development overhead
- The overall system behavior isn't validated until very late, so you might build perfectly tested modules that don't work together as a whole

### Top-Down Integration Testing

Start by testing higher-level modules and move down to lower-level modules.

**Pros:**
- Simulates real-world workflows and user journeys
- Good if lower modules are stable and unlikely to change, and most of the complexity is at a higher level
- Helps find design defects faster
- An early prototype of the system is available sooner, since you start at the UI/workflow layer

**Cons:**
- More difficult to debug
- More difficult to design tests
- Modules at a lower level might not be tested adequately
- Requires "stub" modules (fake lower-level modules) to stand in until real ones are ready, which takes extra effort
- Stubs can misrepresent real behavior, giving false confidence (the same mock-drift risk mentioned earlier)

### Mixed/Sandwich Integration Testing

Runs top-down and bottom-up integration approaches in parallel. Sometimes called the sandwich method because it tests in three layers: the main target layer, the layer below the target layer, and the layer above the target layer.

**Pros:**
- More flexible — you can tailor tests to fit the needs of the project
- Overcomes the disadvantages of both top-down and bottom-up integration

**Cons:**
- Requires more communication within a team to implement and track issues
- Can't be used in highly interdependent systems and is unnecessary for smaller systems
- More costly to run because one part has a top-down approach while another has a bottom-up approach
- Requires both stubs and drivers, which adds more development overhead than any other approach

### Summary Table

| Strategy | Direction | Key Tool Needed | Best For |
|---|---|---|---|
| Big-Bang | All at once | None | Small, simple systems |
| Bottom-Up | Low → High | Drivers | Systems built bottom-up |
| Top-Down | High → Low | Stubs | User-journey-focused, stable lower layers |
| Sandwich/Mixed | Both simultaneously | Stubs + Drivers | Large, complex systems with parallel teams |

## How Can I Apply Integration Testing to JWT Pizza?

Since JWT Pizza is a relatively small system (it doesn't have many layers of modules with complex interdependencies), I will probably just go with the Big-Bang option and try to make it so that my Playwright tests set up a temporary instance of a database and jwt-pizza-service. To eliminate toil, I want to create a GitHub workflow that can run this, but I won't add it directly to my pipeline. This is because I want my default testing before deployment to be quick. If this were a higher-stakes situation, like if the website had a log of customers depending on my website, I would have my integration tests run automatically before I deploy my code. However, since it's just me and I tend to update my code a lot, I would rather be able to quickly deploy new code. I do still want to run integration tests automatically, so I will set up a workflow that runs once a week. I feel like this is the best practice because I want my default testing to be fast, but I still want to consistently make sure my components work together properly.

## Experiment

### Objective

My goal was to create a CI pipeline that could:

1. Create a temporary MySQL database
2. Create a temporary service from my backend repository (https://github.com/elsbels64/jwt-pizza-service)
3. Get my frontend code and run my Playwright tests without any mocking
4. Run automatically on a weekly schedule

### Using Existing CI Pipelines

Fortunately, the pipelines for the backend and frontend code already do most of what I wanted. I used these as a jumping-off point and combined and edited the code I already had in order to create what I wanted.

### Run Automatically on a Weekly Schedule

```yaml
on:
  workflow_dispatch: 
  schedule:
    - cron: '0 0 * * 0'
```

`workflow_dispatch:` makes it so you can press a button and manually run your workflow. `schedule: - cron: '0 0 * * 0'` sets the workflow to run automatically every Sunday at midnight.

### Create a Temporary MySQL Database

```yaml
services:
  mysql:
    image: mysql:8.0.29
    env:
      MYSQL_ROOT_PASSWORD: tempdbpassword
    ports:
      - '3306:3306'
    options: >-
      --health-cmd "mysqladmin ping -ptempdbpassword"
      --health-interval 10s
      --health-start-period 10s
      --health-timeout 5s
      --health-retries 10
```

This sets up a temporary container that has MySQL 8 in it. `3306:3306` maps TCP port 3306 in the container to port 3306 on the Docker host. The health options make GitHub wait until MySQL is actually accepting connections before the job's steps begin.

```yaml
- name: Seed database
  run: |
    chmod +x jwt-pizza-service/generatePizzaData.sh
    jwt-pizza-service/generatePizzaData.sh http://localhost:3000

- name: Verify seed data
  run: |
    echo "Checking admin user exists..."
    curl -s -X PUT http://localhost:3000/api/auth \
      -d '{"email":"a@jwt.com", "password":"admin"}' \
      -H 'Content-Type: application/json'
    echo ""
    echo "Checking menu exists..."
    curl -s http://localhost:3000/api/order/menu
```

This runs a script that populates the empty pizza database. This step is important because it makes the tests run more predictably — they will always start with the same data.

### Create a Temporary Service from the Backend Repository

```yaml
- name: Checkout backend repo
  uses: actions/checkout@v4
  with:
    repository: elsbels64/jwt-pizza-service  
    path: jwt-pizza-service
```

`repository: elsbels64/jwt-pizza-service` pulls the code from https://github.com/elsbels64/jwt-pizza-service. `path: jwt-pizza-service` puts this pulled code in a folder called `jwt-pizza-service`. This keeps the backend code in a separate path from the frontend code so they don't get mixed up.

```yaml
- name: Wait for MySQL to be ready
  run: |
    until mysql -h 127.0.0.1 -u root -ptempdbpassword -e "SELECT 1" 2>/dev/null; do
      echo "Waiting for MySQL..."
      sleep 2
    done
  timeout-minutes: 2
```

This waits for the MySQL database to be running before creating the backend. This step is somewhat redundant because the MySQL container has health checks, but I thought it was good to be extra safe in case it was the reason my tests were breaking.

```yaml
- name: Install backend dependencies
  run: npm ci
  working-directory: jwt-pizza-service
```

These are the dependencies required for the backend. Both the backend and the frontend essentially need the same dependencies, but they need to be set up separately. This is because of the `working-directory` setting, which installs the dependencies in the `jwt-pizza-service` folder rather than the frontend code.

```yaml
- name: Write backend config 
  run: |
    echo "module.exports = {
      jwtSecret: '${{ secrets.JWT_SECRET }}',
      db: {
        connection: {
          host: '127.0.0.1',
          user: 'root',
          password: 'tempdbpassword',
          database: 'pizza',
          connectTimeout: 60000,
        },
        listPerPage: 10,
      },
      factory: {
        url: 'https://pizza-factory.cs329.click',
        apiKey: '${{ secrets.FACTORY_API_KEY }}',
      },
      logging: {
        source: 'integration-test',
        endpointUrl: 'http://localhost:9999',
        accountId: 'none',
        apiKey: 'none',
      },
    };" > jwt-pizza-service/src/config.js
```

This writes the config file required to run the integration tests.

```yaml
- name: Start backend server
  run: npm start > /tmp/backend.log 2>&1 &
  working-directory: jwt-pizza-service
  env:
    PORT: 3000
```

This runs the `npm start` script for the backend server on port 3000 and sends the output to a log file.

```yaml
- name: Wait for backend to be ready
  run: npx wait-on http://127.0.0.1:3000 --timeout 30000
  continue-on-error: true  # don't stop here so we can see the logs
```

This makes sure the backend is fully initialized before the tests start running.

### Get the Frontend Code

```yaml
- name: Checkout frontend repo
  uses: actions/checkout@v4

- name: Setup Node
  uses: actions/setup-node@v4
  with:
    node-version: '22.x'

- name: Install frontend dependencies
  run: npm ci
```

This installs the dependencies required for the frontend.

```yaml
- name: Override frontend env for integration tests
  run: |
    echo "VITE_PIZZA_SERVICE_URL=http://localhost:3000" > .env.local
    echo "VITE_PIZZA_FACTORY_URL=https://pizza-factory.cs329.click" >> .env.local
```

This step writes a `.env.local` file that points the frontend at the local backend server running in the same CI job, instead of the production backend. `.env.local` has the highest priority in Vite's env loading order, so it overrides anything in `.env.development`.

### Run Playwright Tests Without Any Mocking

First, I had to remove the mocking from my test suites. I still wanted to keep the option of running unit tests, so I created two different files within my tests: one for unit testing and one for integration testing. I copied my unit tests and then replaced my `basicInit` functions (which contained all the mocking) with a much simpler function:

```typescript
async function basicInit(page: Page) {
  await page.goto('/');
}
```

I then created new Playwright config files called `playwright.integration.config.js` and `playwright.config.js`, and replaced the `testDir` with the respective files for integration or unit testing.

```yaml
- name: Run integration tests
  run: |
    npx playwright install --with-deps chromium
    npx playwright test --config=playwright.integration.config.js
  env:
    VITE_PIZZA_SERVICE_URL: http://localhost:3000
    CI: true
```

`npx playwright install --with-deps chromium` installs Chromium and runs the Playwright test suite using the integration Playwright config. That config spins up the Vite dev server (pointed at the local backend) and runs all tests in `tests/integration/` against it.

### Debugging

This workflow was broken. I had several errors throughout. The error I still haven’t been able to fix is this error in my “Run integration tests” step:

```
FAILED REQUEST: http://localhost:3000/api/auth net::ERR_CONNECTION_REFUSED
BROWSER: Failed to load resource: net::ERR_CONNECTION_REFUSED
```

Here are the things I did to try to fix my errors.

#### Fixing the Logger

Before the connection error, my code kept crashing because it was trying to connect to Grafana and run the logger. I didn't want it to run the logger, so my solution was to add a catch to the error that the logger throws. Normally, I wouldn't edit my code for my tests, but I felt like this was a good thing to do anyway because I want customers to be able to use the website even if the logger is having issues.

#### Populating the Database

The first problem I ran into was that the pizza database was empty, so I added a step I talked about above that populates the database with information.

#### Storing the Playwright Report

```yaml
- name: Upload Playwright report
  if: always()
  uses: actions/upload-artifact@v4
  with:
    name: playwright-integration-report
    path: |
      playwright-report/
      test-results/
    retention-days: 3
```

This uploads a log of the Playwright tests and any failure screenshots/videos as a GitHub Actions artifact, so I can see what my website looked like right before a test failed.

#### Switching the Port

Because I was having a connection issue, I tried switching the URL used to reach the backend code in several different ways, in case Playwright was changing the address somehow. I tried switching from `localhost` to the IP address `127.0.0.1`. I also tried using IPv4 and IPv6 addresses. I did all these changes in several different places: 
 - VITE_PIZZA_SERVICE_URL in .env.development
 - VITE_PIZZA_SERVICE_URL in .env.local
 - playwright.integration.config.js webServer command — hardcoded VITE_PIZZA_SERVICE_URL=http://127.0.0.1:3000 directly in the npm run dev command
 - jwt-pizza-service/src/index.js — changed the listen address from default to 0.0.0.0 and then tried '::' to bind to both IPv4 and IPv6


#### Adding Checks Before Running Tests

While testing all the different port changes, I also added several checks to make sure I could access the service, the database, and the frontend separately before running the Playwright tests.

```yaml
- name: Verify frontend env
  run: |
    echo "VITE_PIZZA_SERVICE_URL=$VITE_PIZZA_SERVICE_URL"
    grep -r "VITE_PIZZA_SERVICE_URL" .env* || echo "No .env files found"
  env:
    VITE_PIZZA_SERVICE_URL: http://localhost:3000
```

This makes sure the `VITE_PIZZA_SERVICE_URL` environment variable was set properly. I added this when I was testing the difference between changing my actual code and just using a local environment variable.

```yaml
- name: Test backend reachability
  run: |
    curl -v -X PUT http://localhost:3000/api/auth \
      -H 'Content-Type: application/json' \
      -d '{"email":"a@jwt.com","password":"admin"}'
```

This runs a basic login command using `curl` because that was the first request failing in my test suite. This `curl` request worked.

```yaml
- name: Test OPTIONS preflight
  run: |
    curl -v -X OPTIONS http://localhost:3000/api/auth \
      -H 'Origin: http://localhost:5173' \
      -H 'Access-Control-Request-Method: PUT' \
      -H 'Access-Control-Request-Headers: Content-Type'
```

I tried adding an OPTIONS endpoint at one point in case Playwright was calling it and causing everything to crash. This double-checks that the OPTIONS endpoint was set up correctly.

```yaml
- name: Print backend logs before tests
  run: cat /tmp/backend.log
```

This prints the backend logs to make sure there were no errors setting up the backend. I put this in several places in case the backend suddenly failed at any point before the tests ran.

```yaml
- name: Check backend binding
  run: |
    ss -tlnp | grep 3000
    curl -s http://127.0.0.1:3000
```

This checks that the backend was bound to the port I thought it was bound to.

### final yml
My final yml looked like this:
```
name: Integration Testing

on:
  workflow_dispatch:  # manual trigger
  schedule:
    - cron: '0 0 * * 0' #Every Sunday at midnight     

jobs:
  integration:
    name: Integration Tests
    runs-on: ubuntu-latest
    services:
      mysql:
        image: mysql:8.0.29 # get image of container from aws
        env:
          MYSQL_ROOT_PASSWORD: tempdbpassword
        ports:
          - '3306:3306' # access mysql:3306
        options: >-
          --health-cmd "mysqladmin ping -ptempdbpassword"
          --health-interval 10s
          --health-start-period 10s
          --health-timeout 5s
          --health-retries 10

    steps:
      - name: Checkout frontend repo
        uses: actions/checkout@v4

      - name: Checkout backend repo
        uses: actions/checkout@v4
        with:
          repository: elsbels64/jwt-pizza-service  
          path: jwt-pizza-service

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '22.x'

      - name: Install frontend dependencies
        run: npm ci

      - name: Override frontend env for integration tests
        run: |
          echo "VITE_PIZZA_SERVICE_URL=http://localhost:3000" > .env.local
          echo "VITE_PIZZA_FACTORY_URL=https://pizza-factory.cs329.click" >> .env.local

      - name: Install backend dependencies
        run: npm ci
        working-directory: jwt-pizza-service

      - name: Write backend config 
        run: |
          echo "module.exports = {
            jwtSecret: '${{ secrets.JWT_SECRET }}',
            db: {
              connection: {
                host: '127.0.0.1',
                user: 'root',
                password: 'tempdbpassword',
                database: 'pizza',
                connectTimeout: 60000,
              },
              listPerPage: 10,
            },
            factory: {
              url: 'https://pizza-factory.cs329.click',
              apiKey: '${{ secrets.FACTORY_API_KEY }}',
            }, logging: {
              source: 'integration-test',
              endpointUrl: 'http://localhost:9999',
              accountId: 'none',
              apiKey: 'none',
            },
          };" > jwt-pizza-service/src/config.js

      - name: Wait for MySQL to be ready
        run: |
          until mysql -h 127.0.0.1 -u root -ptempdbpassword -e "SELECT 1" 2>/dev/null; do
            echo "Waiting for MySQL..."
            sleep 2
          done
        timeout-minutes: 2

      - name: Start backend server
        run: npm start > /tmp/backend.log 2>&1 &
        working-directory: jwt-pizza-service
        env:
          PORT: 3000
      
      - name: Wait for backend to be ready
        run: npx wait-on http://127.0.0.1:3000 --timeout 30000
        continue-on-error: true  # don't stop here so we can see the log

      - name: Seed database
        run: |
          chmod +x jwt-pizza-service/generatePizzaData.sh
          jwt-pizza-service/generatePizzaData.sh http://localhost:3000

      - name: Verify seed data
        run: |
          echo "Checking admin user exists..."
          curl -s -X PUT http://localhost:3000/api/auth \
            -d '{"email":"a@jwt.com", "password":"admin"}' \
            -H 'Content-Type: application/json'
          echo ""
          echo "Checking menu exists..."
          curl -s http://localhost:3000/api/order/menu

      # - name: Fail if backend never started
      #   run: npx wait-on http://localhost:3000 --timeout 5000

      - name: Verify frontend env
        run: |
          echo "VITE_PIZZA_SERVICE_URL=$VITE_PIZZA_SERVICE_URL"
          grep -r "VITE_PIZZA_SERVICE_URL" .env* || echo "No .env files found"
        env:
          VITE_PIZZA_SERVICE_URL: http://localhost:3000

      - name: Test backend reachability
        run: |
          curl -v -X PUT http://localhost:3000/api/auth \
            -H 'Content-Type: application/json' \
            -d '{"email":"a@jwt.com","password":"admin"}'

      - name: Test OPTIONS preflight
        run: |
          curl -v -X OPTIONS http://localhost:3000/api/auth \
            -H 'Origin: http://localhost:5173' \
            -H 'Access-Control-Request-Method: PUT' \
            -H 'Access-Control-Request-Headers: Content-Type'

      - name: Print backend logs before tests
        run: cat /tmp/backend.log

      - name: Check backend binding
        run: |
          ss -tlnp | grep 3000
          curl -s http://127.0.0.1:3000 
          # curl -s http://[::1]:3000
            
      - name: Run integration tests
        run: |
          npx playwright install --with-deps chromium
          npx playwright test --config=playwright.integration.config.js
        env:
          VITE_PIZZA_SERVICE_URL: http://localhost:3000  # ← points frontend at local backend
          CI: true

      - name: Upload Playwright report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-integration-report
          path: |
            playwright-report/
            test-results/
          retention-days: 3
```

## Conclusion

Unfortunately, I wasn't able to get Playwright to run on my GitHub pipeline, even with all these checks and changes. I did learn a lot about the disadvantages of integration testing through this process, though. When I was first reading about integration testing, I kept seeing people say that it was more difficult to debug than unit testing. Honestly, I thought they were exaggerating a bit. However, after this curiosity report, I now know that this is, in fact, a very real drawback. I was having trouble debugging just the setup, so I can't imagine how much harder it would be to debug an actual issue in my code. I found debugging integration testing to be especially difficult because the tests took a really long time to run, and it's hard to track what's going on in the connection between components. The long run time of the tests made it so that each little change I made to my code took at least an extra minute. Not being able to tell what was going on in the connection between components made it really difficult to tell why a connection was failing. I still think integration testing is very important, and I really want to eventually get it set up. I will continue to try to fix my `.yml` so that I can run integration tests on my jwt-pizza code. However, I now also know that integration testing definitely comes with real disadvantages when it comes to setup and debugging.

## Resources

- https://www.geeksforgeeks.org/software-testing/software-engineering-integration-testing/
- https://www.opkey.com/blog/integration-testing-a-comprehensive-guide-with-best-practices
- https://katalon.com/resources-center/blog/integration-testing
- https://www.testingxperts.com/blog/what-is-integration-testing
- https://docs.github.com/en/actions/tutorials/use-containerized-services/use-docker-service-containers
- https://docs.github.com/en/actions/tutorials/build-and-test-code/nodejs
