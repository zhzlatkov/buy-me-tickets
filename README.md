````markdown
# Event Reservation Bot

This script is designed to automate the ticket reservation process for events on Eventim.bg. The script will periodically check for the availability of the event and automatically reserve tickets when they become available.

## Installation

1. Clone this repository to your local machine:

    ```bash
    git clone <https://github.com/zhzlatkov/buy-me-tickets>
    ```
````

2. Navigate to the project directory:

    ```bash
    cd buy-me-tickets
    ```

3. Install the required Node.js packages:

    ```bash
    npm install
    ```

4. Create a `.env` file in the project directory and configure the environment variables as explained below.

## Configuration

Open the `.env` file in your project directory and configure the following environment variables:

### Chrome Browser Configuration (Optional)

-   `CHROME_PATH`: If you want to use your own Chrome browser, provide the path to the executable. If not specified, the script will use the built-in Chromium browser. Using your Chrome browser make the chance Eventime catch this bot smaller.

### Event Configuration

-   `URL`: The URL to the category or subcategory of the event on Eventim.bg.
-   `PART_OF_EVENT_NAME`: Part of the event name. If the event is in Cyrillic, use a transliterated name.
-   `PART_OF_EVENT_PLACE`: Part of the event place or location.
-   `NUMBER_OF_TICKETS`: The number of tickets you want to reserve.
-   `MAX_BUDGET_PER_TICKET`: Your maximum budget per ticket.
-   `RETRY_IN_SECONDS`: The interval in seconds to check if the event is published.
-   `TIMES_TO_RETRY`: The number of times to retry based on the retry interval.

### Information for Placing Your Order (Optional)

#### If the "Information for Placing Your Order" is not provided, the script will perform the reservation process but will not complete the purchase.

-   `EMAIL`: Your email address.
-   `NAME`: Your first name.
-   `SURNAME`: Your last name.
-   `ADDRESS`: Your address.
-   `POSTAL_CODE`: Your postal code.
-   `CITY`: Your city.
-   `PHONE_NUMBER`: Your phone number.

### Information for Card Payment (Optional)

#### If the "Information for Card Payment" is not provided, the script will make the reservation and proceed to the payment step but will not complete the payment process.

-   `CARD_NUMBER`: Your card number.
-   `CARD_HOLDER`: The cardholder's name.
-   `CARD_EXPIRY`: Card expiration date (MM/YY).
-   `CARD_CVC`: Card security code (CVC).

## Usage

To run the script, execute the following command in your project directory:

```bash
npm run buy-me-tickets
```

The script will automate the ticket reservation process based on your configuration.

## Important Notes

-   Make sure to set the `CHROME_PATH` environment variable if you want to use your own Chrome browser.
-   Adjust the configuration variables to match your specific requirements.
-   Use this script responsibly and ensure that it complies with the terms of service of Eventim.bg.
-   Running this script too frequently or with short retry intervals may result in a ban from the website.
-   If you don't provide optional data the script will still work but not with full potential for example without Information for Placing Your Order will only make a reservation, without Information for Card Payment would make a payment for you.

**Please use this script responsibly and only for legal and ethical purposes.**
