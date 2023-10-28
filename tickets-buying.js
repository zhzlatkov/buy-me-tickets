const { chromium } = require('playwright');
require('dotenv').config();

async function TicketsBuying() {
    let browser;
    if (process.env.CHROME_PATH) {
        try {
            browser = await chromium.launch({
                headless: false,
                executablePath: process.env.CHROME_PATH,
            });
        } catch (e) {
            console.error(e.message);
            console.error(
                'Launching Chromium browser because could not launch your Chrome browser because of this error:'
            );
            browser = await chromium.launch({ headless: false, slowMo: 100 });
        }
    }

    if (!process.env.CHROME_PATH) {
        console.error(
            'Launching Chromium browser because you did not provide your Chrome browser path.'
        );
        browser = await chromium.launch({ headless: false, slowMo: 100 });
    }

    const context = await browser.newContext();
    const page = await context.newPage();

    const pageUrl = process.env.URL;
    const searchHrefValue =
        process.env.PART_OF_EVENT_NAME || process.env.PART_OF_EVENT_PLACE || '';

    const maximumBudgetPerTicket =
        Number(process.env.MAX_BUDGET_PERTICKET) || undefined;
    const numberOfTickets = Number(process.env.NUMBER_OF_TICKETS) || 2;

    const timeOutInSeconds =
        (Number(process.env.RETRY_IN_SECONDS) || 30) * 1000;
    let timesToRetry = Number(process.env.TIMES_TO_RETRY) || 200;

    const email = process.env.EMAIL || '';
    const name = process.env.NAME || '';
    const surname = process.env.SURNAME || '';
    const address = process.env.ADDRESS || '';
    const postalCode = process.env.POSTAL_CODE || '';
    const city = process.env.CITY || '';
    const phoneNumber = process.env.PHONE_NUMBER || '';

    const cardNumber = process.env.CARD_NUMBER || '';
    const cardHolder = process.env.CARD_HOLDER || '';
    const cardExpiry = process.env.CARD_EXPIRY || '';
    const cardCvc = process.env.CARD_CVC || '';

    const eventLink =
        (await waitForPublishedEvent(
            page,
            pageUrl,
            searchHrefValue,
            timesToRetry,
            timeOutInSeconds
        )) || '';
    if (!eventLink) {
        console.error('There was no event with your search!');
    }
    await page.waitForTimeout(5000);

    const expectedUrl = new RegExp(eventLink, 'i');
    await page.goto('https://www.eventim.bg' + eventLink);
    await page.waitForTimeout(1000);

    const ticketButton = page
        .getByRole('button', { name: /tickets|билети/i })
        .locator('visible=true')
        .first();
    await ticketButton.scrollIntoViewIfNeeded();
    const isTicketButtonVisible = ticketButton.isVisible();
    if (isTicketButtonVisible) {
        await page.waitForTimeout(getRandomNumber(1200, 6000));
        await ticketButton.click();
    }
    await page.waitForTimeout(getRandomNumber(1200, 6000));

    await selectTickets(page, maximumBudgetPerTicket, numberOfTickets);

    await page.waitForTimeout(getRandomNumber(1200, 6000));
    await page.locator('.-submit').locator('visible=true').first().click();

    await scrollAndClickConfirmButton(page);

    await page.waitForTimeout(getRandomNumber(1200, 6000));
    await page.locator('.a-panel__header').last().click();

    if ((page, email, name, surname, address, postalCode, city, phoneNumber)) {
        await formFill(
            page,
            email,
            name,
            surname,
            address,
            postalCode,
            city,
            phoneNumber
        );
        await page.waitForTimeout(getRandomNumber(1200, 6000));

        await scrollAndClickConfirmButton(page);

        await scrollAndClickConfirmButton(page);

        await page.locator('.row .a-panel__header').last().click();
        await scrollAndClickConfirmButton(page);

        await page
            .getByText(
                'Декларирам, че имам навършени 16г. и съм съгласен с ОБЩИ УСЛОВИЯ ЗА ПОКУПКА НА Б'
            )
            .click();
        await page.waitForTimeout(getRandomNumber(1200, 6000));
        await scrollAndClickConfirmButton(page);

        if ((cardNumber, cardHolder, cardExpiry, cardCvc)) {
            await payWithCard(
                page,
                cardNumber,
                cardHolder,
                cardExpiry,
                cardCvc
            );
        }
    }
}

TicketsBuying();

function getRandomNumber(min = 500, max = 7000) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function scrollAndClickConfirmButton(page) {
    await page.locator('.a-button__component').last().scrollIntoViewIfNeeded();
    await page.locator('.a-button__component').last().click();
    await page.waitForTimeout(getRandomNumber(1150, 6700));
}

async function waitForPublishedEvent(
    page,
    pageUrl,
    searchHrefValue,
    timesToRetry,
    timeOutInSeconds
) {
    if (timesToRetry < 0) return false;
    timesToRetry--;
    await page.goto(pageUrl);
    const loadMoreButtonLocator = page.locator('.m-searchList__loadMore');
    while (await loadMoreButtonLocator.isVisible()) {
        await loadMoreButtonLocator.click();
        await page.waitForTimeout(getRandomNumber(750, 2700));
    }
    const eventLinksLocator = page.locator('a.m-eventListItem');
    const allEvents = await eventLinksLocator.all();
    let eventLink = '';
    for (let event of allEvents) {
        const hrefAttribute = await event.getAttribute('href');
        if (!hrefAttribute?.includes(searchHrefValue)) continue;
        return (eventLink = hrefAttribute);
    }
    if (!eventLink) {
        setTimeout(async () => await waitForPublishedEvent(), timeOutInSeconds);
    }
    return eventLink;
}

async function selectTickets(page, maximumBudgetPerTicket, numberOfTickets) {
    const ticketSectionHeading = page.locator(
        '.o-singleTicketTypeSelection__heading'
    );
    const isTicketSectionHeadingVisible =
        await ticketSectionHeading.isVisible();
    if (isTicketSectionHeadingVisible) {
        await page.waitForTimeout(getRandomNumber(750, 2700));
        const availablePriceCategoryLocator = page
            .locator('.-available')
            .locator('visible=true');
        if (!maximumBudgetPerTicket) {
            await page.waitForTimeout(getRandomNumber(500, 2000));
            await availablePriceCategoryLocator.first().click();
            await page.waitForTimeout(getRandomNumber(500, 2000));
        }
        if (maximumBudgetPerTicket) {
            const allPriceCategories =
                await availablePriceCategoryLocator.all();
            for (let priceCategory of allPriceCategories) {
                const innerText = await priceCategory.innerText();
                const price =
                    Number(innerText.match(/(\d+(?:,\d+)?)\s*лв/i)?.[0]) || 0;
                if (price < maximumBudgetPerTicket) {
                    await page.waitForTimeout(getRandomNumber(500, 2000));
                    await priceCategory.click();
                    await page.waitForTimeout(getRandomNumber(500, 2000));
                }
            }
        }
        let amountTickets = Number(
            await ticketSectionHeading.locator('.a-Stepper__amount').innerText()
        );
        while (amountTickets !== numberOfTickets) {
            if (amountTickets < numberOfTickets) {
                const ticketIncreaseButton = ticketSectionHeading.locator(
                    '[data-qa=stepper-increase]'
                );
                await page.waitForTimeout(getRandomNumber(500, 2000));
                await ticketIncreaseButton.click();
                amountTickets = Number(
                    await ticketSectionHeading
                        .locator('.a-Stepper__amount')
                        .innerText()
                );
            }
            if (amountTickets > numberOfTickets) {
                const ticketIncreaseButton = ticketSectionHeading.locator(
                    '[data-qa=stepper-decrease]'
                );
                await page.waitForTimeout(getRandomNumber(500, 2000));
                await ticketIncreaseButton.click();
                amountTickets = Number(
                    await ticketSectionHeading
                        .locator('.a-Stepper__amount')
                        .innerText()
                );
            }
        }
        return;
    }

    const priceLevel = page.locator('.m-priceLevel .-is-open');
    const isPriceLevelVisible = await priceLevel.isVisible();
    if (isPriceLevelVisible) {
        const innerText = await priceLevel
            .locator('.m-priceLevel__title')
            .innerText();
        const price = Number(innerText.match(/(\d+(?:,\d+)?)\s*лв/i)?.[0]) || 0;
        if (price > maximumBudgetPerTicket) return;

        // check this one
        const amountTickets = Number(
            await ticketSectionHeading.locator('.a-Stepper__amount').innerText()
        );
        while (amountTickets !== numberOfTickets) {
            if (amountTickets < numberOfTickets) {
                const ticketIncreaseButton = ticketSectionHeading.locator(
                    '[data-qa=stepper-increase]'
                );
                await page.waitForTimeout(getRandomNumber(500, 2000));
                await ticketIncreaseButton.click();
                amountTickets = Number(
                    await ticketSectionHeading
                        .locator('.a-Stepper__amount')
                        .innerText()
                );
            }
            if (amountTickets > numberOfTickets) {
                const ticketIncreaseButton = ticketSectionHeading.locator(
                    '[data-qa=stepper-decrease]'
                );
                await page.waitForTimeout(getRandomNumber(500, 2000));
                await ticketIncreaseButton.click();
                amountTickets = Number(
                    await ticketSectionHeading
                        .locator('.a-Stepper__amount')
                        .innerText()
                );
            }
        }
        return;
    }

    const priceLevelIndicator = page.locator('.m-priceLevelIndicator__content');
    const isPriceLevelIndicatorVisible = await priceLevelIndicator.isVisible();
    if (isPriceLevelIndicatorVisible) {
        return;
    }
}

async function formFill(
    page,
    email,
    name,
    surname,
    address,
    postalCode,
    city,
    phoneNumber
) {
    await page.locator('#email').last().scrollIntoViewIfNeeded();
    await page.locator('#email').last().click();
    await page.locator('#email').last().type(email);
    await page.waitForTimeout(getRandomNumber(700, 7000));

    await page.locator('#name').click();
    await page.locator('#name').type(name);
    await page.waitForTimeout(getRandomNumber(700, 7000));

    await page.locator('#surname').click();
    await page.locator('#surname').type(surname);
    await page.waitForTimeout(getRandomNumber(700, 7000));

    await page.locator('#address').scrollIntoViewIfNeeded();
    await page.locator('#address').click();
    await page.locator('#address').type(address);
    await page.waitForTimeout(getRandomNumber(700, 7000));

    await page.locator('#postalCode').click();
    await page.locator('#postalCode').type(postalCode);
    await page.waitForTimeout(getRandomNumber(700, 7000));

    await page.locator('#city').click();
    await page.locator('#city').type(city);
    await page.waitForTimeout(getRandomNumber(700, 7000));

    await page.locator('#country').click();
    await page.waitForTimeout(getRandomNumber(700, 7000));
    await page
        .getByLabel('Options list')
        .getByText('България')
        .first()
        .scrollIntoViewIfNeeded();
    await page.waitForTimeout(getRandomNumber(700, 7000));
    await page.getByLabel('Options list').getByText('България').first().click();
    await page.waitForTimeout(getRandomNumber(700, 7000));

    await page.locator('#mobile').scrollIntoViewIfNeeded();
    await page.locator('#mobile').click();
    await page.waitForTimeout(getRandomNumber(700, 7000));
    await page
        .getByLabel('Options list')
        .getByText('България')
        .first()
        .scrollIntoViewIfNeeded();
    await page.waitForTimeout(getRandomNumber(700, 7000));
    await page.getByLabel('Options list').getByText('България').first().click();
    await page.waitForTimeout(getRandomNumber(700, 7000));

    await page.locator('#number').click();
    await page.waitForTimeout(getRandomNumber(700, 7000));
    await page.locator('#number').type(phoneNumber);
}

async function payWithCard(page, cardNumber, cardHolder, cardExpiry, cardCvc) {
    await page.getByPlaceholder('0000 0000 0000 0000').click();
    await page.waitForTimeout(getRandomNumber(1000, 4000));
    await page.getByPlaceholder('0000 0000 0000 0000').type(cardNumber);
    await page.waitForTimeout(getRandomNumber(1000, 4000));

    await page.getByPlaceholder('Cardholder Name').click();
    await page.waitForTimeout(getRandomNumber(1000, 4000));
    await page.getByPlaceholder('Cardholder Name').type(cardHolder);
    await page.waitForTimeout(getRandomNumber(1000, 4000));

    await page.getByPlaceholder('MM/YY').click();
    await page.waitForTimeout(getRandomNumber(1000, 4000));
    await page.getByPlaceholder('MM/YY').type(cardExpiry);
    await page.waitForTimeout(getRandomNumber(1000, 4000));

    await page.getByPlaceholder('CVC').click();
    await page.waitForTimeout(getRandomNumber(1000, 4000));
    await page.getByPlaceholder('CVC').type(cardCvc);
    await page.waitForTimeout(getRandomNumber(1000, 4000));

    await page.getByRole('button', { name: 'Плати', exact: true }).click();
}
