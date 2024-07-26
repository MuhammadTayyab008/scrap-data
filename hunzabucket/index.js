const cheerio = require("cheerio");
const axios = require("axios");
const fs = require("fs");

async function runScraping() {
    try {
        const URL = "https://www.hunzabucket.com/shop/";
        const response = await axios.get(URL);
        const $ = cheerio.load(response.data);

        const allProductLinks = [];
        $("ul.products li.col-lg-4 div.product-thumb-hover a").each((index, element) => {
            const link = $(element).attr("href");
            allProductLinks.push(link);
        });

        const allProducts = [];

        for (const productLink of allProductLinks) {
            try {
                const productResponse = await axios.get(productLink);
                const $ = cheerio.load(productResponse.data);

                const productUrl = $('.woocommerce-LoopProduct-link').attr('href');
                const productName = $("h1.product_title").text().trim();
                const price = $("p.price span.woocommerce-Price-amount").first().text().trim();
                const description = $("div.description p").text().trim();
                const imageUrl = $("div.woocommerce-product-gallery__image img").attr("src");
                allProducts.push({
                    name: productName,
                    price: price,
                    stock: 10,
                    description: description,
                    imageUrl: imageUrl ? imageUrl : null,
                    productUrl: productUrl ? productUrl : null
                });
            } catch (error) {
                console.error(`Error scraping product details from ${productLink}:`, error.message);
            }
        }

        fs.writeFileSync("scrapedData.json", JSON.stringify(allProducts, null, 2));
        console.log("Scraping complete. Data saved to scrapedData.json");

    } catch (error) {
        console.error("Error scraping the site:", error.message);
    }
}

runScraping();
