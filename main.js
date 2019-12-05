const Apify = require('apify');

Apify.main(async () => {
    const input = await Apify.getInput();
    console.log('Input:');
    console.dir(input);

    const getRequest = async (url) => {
        const getProxyUrl = () => {
            return Apify.getApifyProxyUrl({
                password: process.env.APIFY_PROXY_PASSWORD,
                groups: proxyConfiguration.apifyProxyGroups,
                session: `airbnb_${Math.floor(Math.random() * 100000000)}`,

            });
        };
        const getData = async (attempt = 0) => {
            let response;
            const agent = new ProxyAgent(getProxyUrl());
            const options = {
                url,
                headers: {
                    'x-airbnb-currency': currency,
                    'x-airbnb-api-key': process.env.API_KEY,
                },
                agent: {
                    https: agent,
                    http: agent,
                },
                json: true,
                retry: {
                    retries: 4,
                    errorCodes: ['EPROTO'],
                },
            };
            try {
                response = await got(options);
            } catch (e) {
                log.exception(e.message, 'GetData error');

                if (attempt >= 10) {
                    throw new Error(`Could not get data for: ${options.url}`);
                }

                if (e.statusCode === 429 && e.statusCode === 503) {
                    response = await getData(attempt + 1);
                }
            }
            return response.body;
        };

        return getData();
    };

    // Save output
    const output = {
        receivedInput: input,
        message: 'Hello sir!',
    };
    console.log('Output:');
    console.dir(output);
    await Apify.setValue('OUTPUT', output);
});
