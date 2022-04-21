const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  await page.goto('https://offerzen.webflow.io/employers');
});

test.describe('ngrok', () => {
  test('should not contain as part of form submissions', async ({ page }) => {
    const formElement = page.locator('#wf-Company-Lead-Form');
    const formAction = await formElement.getAttribute('method');

    console.log('form action: ', formAction)

    expect(formAction).not.toContain('ngrok.io')
  });
});

test.describe('form submissions', () => {
  test('should contain the correct payloads to the form leads endpoint', async ({ page }) => {
    await page.locator('#contact_name').fill('Playwright Test');
    await page.locator('#contact_email').fill('playwrighttest@offerzen.com');
    await page.locator('#phone-number').fill('0811111111');
    await page.locator('#company_name').fill('Playwright Test');
    await page.locator('.role-type-field-flex').first().click();
    await page.locator('#number_of_hires').selectOption('5-6 hires');
    await page.locator("span[for='subscribe_to_company_newsletter']").click();
    await page.locator("span[for='accepted_terms_of_service']").click();

    const [request] = await Promise.all([
      page.waitForRequest('**/company/form_leads'),
      page.click("input[type='submit']")
    ]);

    await expect(Object.keys(request.postDataJSON())).toEqual(['contact_name', 'contact_email', 'phone-number', 'company_name', 'number_of_hires', 'skills', 'subscribe_to_company_newsletter', 'accepted_terms_of_service', 'registration_part', 'subscribe_to_hiring_insights', 'dial_code', 'contact_phone', 'referrer', 'lead_form_type', 'report_source', 'workplace_policy', 'skills_hiring_for', 'g-recaptcha-response-data']);

    const requestValues = Object.values(request.postDataJSON()).filter(val => typeof(val) !== 'object');

    await expect(requestValues).toEqual(['Playwright Test', 'playwrighttest@offerzen.com', '0811111111', 'Playwright Test', '5-6 hires', '', 'on', 'on', 'sa_webflow', 'on', '+27', '+27811111111', 'https://offerzen.webflow.io/employers', 'company_signup', 'In-office', ''])

    console.log('debug time');
  });
});
