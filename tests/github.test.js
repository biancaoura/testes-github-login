require('dotenv').config();

jest.setTimeout(60000);

const githubURL = 'https://github.com/';

const signInBtn = 'body > div.logged-out.env-production.page-responsive.header-overlay.home-campaign > div.position-relative.js-header-wrapper > header > div > div.HeaderMenu--logged-out.p-responsive.height-fit.position-lg-relative.d-lg-flex.flex-column.flex-auto.pt-7.pb-4.top-0 > div > div > div.position-relative.mr-lg-3.d-lg-inline-block > a';

const emailInput = '#login_field';

const passwordInput = '#password';

const loginBtn = '#login > div.auth-form-body.mt-3 > form > div > input.btn.btn-primary.btn-block.js-sign-in-button';

const profileDropdown = '[aria-label="View profile and more"]';

const usernameSelector = 'body > div.logged-in.env-production.page-responsive.full-width > div.position-relative.js-header-wrapper > header > div.Header-item.position-relative.mr-0.d-none.d-md-flex > details > details-menu > div.header-nav-current-user.css-truncate > a > strong';

describe('Testando login no "GitHub"', () => {
  beforeAll(async () => {
    await page.goto(githubURL);
  });

  it('1 - Deve ser possível logar com o nome de usuário e senha corretos', async () => {
    expect(await page.title()).toBe('GitHub: Let’s build from here · GitHub');

    await page.click(signInBtn);

    await page.waitForSelector(emailInput);

    expect(await page.title()).toBe('Sign in to GitHub · GitHub');

    await page.type(emailInput, process.env.EMAIL);
    await page.type(passwordInput, process.env.PASSWORD);
    await page.click(loginBtn);
    
    await page.waitForSelector(profileDropdown);
    await page.click(profileDropdown);

    const url = await page.url();
    expect(url).toBe(githubURL);

    await page.waitForSelector(usernameSelector);

    const username = await page.$eval(usernameSelector, el => el.textContent);
    
    expect(username).toBe(process.env.USERNAME);
  });

  it('2 - Deve ser possível abrir um PR e deslogar', async () => {
    const repoBtn = 'body > div.logged-in.env-production.page-responsive.full-width > div.position-relative.js-header-wrapper > header > div.Header-item.position-relative.mr-0.d-none.d-md-flex > details > details-menu > a:nth-child(6)';

    await page.click(repoBtn);

    const repoList = '#user-repositories-list > ul'

    await page.waitForSelector(repoList);

    const parent = await page.$(repoList);
    const listItems = await parent.$$(':scope > *');

    const randomNum = Math.floor(1 + Math.random() * listItems.length);

    const randomRepo = `#user-repositories-list > ul > li:nth-child(${randomNum}) > div.col-10.col-lg-9.d-inline-block > div.d-inline-block.mb-1 > h3 > a`;

    await page.click(randomRepo);

    const pullRequestBtn = '#pull-requests-tab';

    // Abrindo PR
    await page.waitForSelector(pullRequestBtn);
    await page.click(pullRequestBtn);

    await page.waitForSelector(profileDropdown);
    await page.click(profileDropdown);

    const signOutBtn = '.dropdown-item.dropdown-signout';

    await page.waitForSelector(signOutBtn);
    await page.click(signOutBtn);

    await page.waitForNavigation();

    expect(await page.url()).toBe(githubURL);
    expect(signInBtn).toBeDefined();
  });

  it('3 - Mostra mensagem de erro se a senha for incorreta', async () => {
    await page.click(signInBtn);

    await page.waitForSelector(emailInput);

    await page.type(emailInput, process.env.EMAIL);
    await page.type(passwordInput, 'invalidpassword');

    await page.click(loginBtn);

    const loginPage = 'https://github.com/session';

    expect(await page.url()).toBe(loginPage);

    const loginAlert = '#js-flash-container > div > div > div';
    const loginErrMsg = 'Incorrect username or password.';

    expect(await page.waitForSelector(loginAlert)).toBeDefined();

    const loginErr = await page.$eval(loginAlert, el => el.textContent);

    expect(loginErr).toMatch(loginErrMsg);
  });
});