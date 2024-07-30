const cheerio = require("cheerio");
const axios = require("axios");
const fs = require("fs");

async function runScraping() {
    try {
        const URL = "https://pickypunch.pk/";
        const response = await axios.get(URL);
        const $ = cheerio.load(response.data);

        // Use a Set to store unique product links
        const allProductLinks = new Set();
        $("ul.grid li.grid__item a.full-unstyled-link").each((index, element) => {
            const link = $(element).attr("href");
            allProductLinks.add(URL + link);
        });

        const allProducts = [];

        for (const productLink of allProductLinks) {
            try {
                const productResponse = await axios.get(productLink);
                const $ = cheerio.load(productResponse.data);

                const productUrl = productLink;
                const productName = $(".product__info-wrapper .product__title").text().replace(/\s+/g, " ").trim();
                const price = $(".price__regular .price-item").first().text().trim();
                // const description = $(".woocommerce-product-details__short-description").text().trim();
                const imageUrl = $("div.product__media img").attr("src");

                const fullImageUrl = imageUrl ? (imageUrl.startsWith('http') ? imageUrl : URL + imageUrl) : null;

                allProducts.push({
                    name: productName,
                    price: price,
                    stock: 10,
                    // description: description,
                    imageUrl: fullImageUrl,
                    productUrl: productUrl
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
