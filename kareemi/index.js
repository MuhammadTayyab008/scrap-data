const cheerio = require("cheerio");
const axios = require("axios");
const fs = require("fs");

async function runScraping() {
    try {
        const baseUrl = "https://kaareemi.com/";
        const initialPageUrl = "/collections/all";
        const totalPages = 3;

        const products = [];

        for (let page = 1; page <= totalPages; page++) {
            const pageUrl = page === 1 ? initialPageUrl : `${initialPageUrl}?page=${page}`;
            const response = await axios.get(baseUrl + pageUrl);
            const $ = cheerio.load(response.data);

            const allProductLinks = new Set();
            $("li.grid__item div.card__information a").each((index, element) => {
                const href = $(element).attr("href");
                if (href) {
                    allProductLinks.add(baseUrl + href);
                }
                console.log("🚀 ~ $ ~ allProductLinks:", allProductLinks)
            });

            // Scrape each product link for details
            for (const productLink of allProductLinks) {
                try {
                    const productResponse = await axios.get(productLink);
                    const $ = cheerio.load(productResponse.data);

                    const productName = $("div.product__title")
                        .text()
                        .replace(/\s+/g, " ")
                        .trim();
                    const price = $("span.price-item")
                        .first()
                        .text()
                        .replace(/\s+/g, " ")
                        .trim();
                    const description = $("div.product__description p")
                        .text()
                        .replace(/\s+/g, " ")
                        .trim();

                    // Handle image URL extraction
                    const imgElement = $("div.product__media img");
                    let imageUrl =
                        imgElement.attr("src") || imgElement.attr("srcset")?.split(" ")[0];
                    if (imageUrl && imageUrl.startsWith("//")) {
                        imageUrl = "https:" + imageUrl;
                    }
                    products.push({
                        name: productName,
                        price: price,
                        stock: 10,
                        description: description,
                        imageUrl: imageUrl ? imageUrl : null,
                        productUrl: productLink ? productLink : null
                    });

                } catch (error) {
                    console.error(
                        `Error scraping product details from ${productLink}:`,
                        error
                    );
                }
            }

            // console.log(`Scraped data from page ${page}`);s
        }

        fs.writeFileSync("scrapedData.json", JSON.stringify(products, null, 2));
        console.log("Scraping complete. Data saved to scrapedData.json");
    } catch (error) {
        console.error("Error scraping the site:", error);
    }
}

runScraping();
