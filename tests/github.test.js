require('dotenv').config();

jest.setTimeout(60000);

const githubURL = 'https://github.com/';

const signInBtn = 'xpath///a[contains(@href, "login")]'

const emailInput = '#login_field';

const passwordInput = '#password';

const loginBtn = 'xpath///input[@value="Sign in"]'

const profileDropdown = '[aria-label="View profile and more"]';

const usernameSelector = 'xpath///strong[@class="css-truncate-target"]'

describe('Testando interações no GitHub', () => {
  
  beforeAll(async () => {
    await page.goto(githubURL);
  });

  describe('Testando login com sucesso', () => {
    
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
      
      expect(username).toBe(process.env.GITHUB_USER);
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
  });
  
  describe('Testando login incorreto', () => {
    it('1 - Mostra mensagem de erro se a senha for incorreta', async () => {
      await page.click(signInBtn);
      
      await page.waitForSelector(emailInput);
      
      await page.type(emailInput, process.env.EMAIL);
      await page.type(passwordInput, 'invalidpassword');
      
      await page.click(loginBtn);
      
      const loginPage = 'https://github.com/session';
      
      const url = await page.url();
      expect(url).toBe(loginPage);
      
      const loginAlert = '#js-flash-container > div > div > div';
      const loginErrMsg = 'Incorrect username or password.';
      
      expect(await page.waitForSelector(loginAlert)).toBeDefined();
      
      const loginErr = await page.$eval(loginAlert, el => el.textContent);
      
      expect(loginErr).toMatch(loginErrMsg);
    });
  });
});