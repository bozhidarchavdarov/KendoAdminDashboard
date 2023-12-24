# KendoAdminDashboard

* Created admin dashboard with Kendo components. 
* URL: https://danieltakev.github.io/KendoAdminDashboard/

Focus on the Playwright functionalities: 
* Standard design pattern: Page Object Model
* Added E2E suite with sample tests and reports. The reports are only available on local execution (the folders are dynamically generated and `git ignored`).
* The initial page setup is handled into the `prerequisites-setup.ts` file where the global Playwright const `test` is extended and all prerequisites are done before the test execution. 
* Managed download functionality and Excel files verification. 
- Technologies: `TypeScript`, `HTML`, `CSS` and `Playwright` for E2E testing

**To start the local server run:**
* run `ng serve` command into the main `kendo-admin-dashboard` folder

**To start the E2E tests against production:**
* run `npx playwright test` into the `e2e` folder

**To start the E2E tests against the local server:**
* run the server and update the playwright.config.ts file as following: change `baseURL: 'https://danieltakev.github.io'` to `baseURL: 'http://localhost:4200'`
