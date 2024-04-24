const axios = require('axios');
const xml2js = require('xml2js');
const { JSDOM } = require('jsdom');

async function getUrlsFromSitemap(sitemapUrl) {
    try {
        const response = await axios.get(sitemapUrl);
        const xml = response.data;
        const parser = new xml2js.Parser({ explicitArray: false });
        const result = await parser.parseStringPromise(xml);
        const urls = result.urlset.url.map(url => url.loc);
        return urls;
    } catch (error) {
        console.error('Error fetching URLs from sitemap:', error);
        return [];
    }
}

async function searchKeywordInPage(url, keyword) {
    try {
        const response = await axios.get(url);
        const dom = new JSDOM(response.data);
        console.log('test4:');
        const bodyText = dom.window.document.querySelector('body').textContent;
        const keywordCount = (bodyText.match(new RegExp(keyword, 'gi')) || []).length;
        return keywordCount;
    } catch (error) {
        console.error('Error searching keyword in page:', error);
        return 0;
    }
}

async function main(sitemapUrl, keyword) {
    const urls = await getUrlsFromSitemap(sitemapUrl).then(urls => urls.slice(0, 10)); // Limit to the first two URLs
    let totalOccurrences = 0;
    const results = [];

    for (const url of urls) {
        const occurrences = await searchKeywordInPage(url, keyword);
        if (occurrences > 0) {
            totalOccurrences += occurrences;
            results.push({ url, occurrences });
        }
    }

    console.log(`Total occurrences of '${keyword}' found: ${totalOccurrences}`);
    console.log('URLs and occurrences:');
    results.forEach(result => {
        console.log(`${result.url} - ${result.occurrences} occurrences`);
    });
}

const sitemapUrl = 'https://www.london.gov.uk/sitemap.xml?page=1';
const keyword = 'the Mayor of London';

main(sitemapUrl, keyword);