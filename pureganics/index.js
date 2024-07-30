const cheerio = require("cheerio");
const axios = require("axios");
const fs = require("fs");

async function runScraping() {
    try {
        const URL = "https://pureganics.pk/collections/shop-all";
        const response = await axios.get(URL);
        const $ = cheerio.load(response.data);

        const allProductLinks = new Set();  // Use Set to avoid duplicates
        const baseUrl = "https://pureganics.pk/";

        // Collect all product links
        $("ul.grid li.grid__item a").each((index, element) => {
            const href = $(element).attr("href");
            if (href) {
                allProductLinks.add(baseUrl + href);
            }
        });

        const products = [];

        // Scrape each product link for details
        for (const productLink of allProductLinks) {
            try {
                const productResponse = await axios.get(productLink);
                console.log("🚀 ~ runScraping ~ productResponse:", productResponse)
                const $ = cheerio.load(productResponse.data);

                const productUrl = productLink;
                const productName = $(".product__title")
                    .text()
                    .replace(/\s+/g, " ")
                    .trim();

                const price = $(".price__regular .price-item, .price__sale .price-item")
                    .first()
                    .text()
                    .replace(/\s+/g, " ")
                    .trim();

                const description = $(".product__description")
                    .text()
                    .replace(/\s+/g, " ")
                    .trim();

                // Handle image URL extraction
                const imgElement = $("div.product__media img");
                var imageUrl = imgElement.attr("src") || imgElement.attr("srcset")?.split(" ")[0];
                if (imageUrl && imageUrl.startsWith("//")) {
                    imageUrl = "https:" + imageUrl;
                } else if (imageUrl && !imageUrl.startsWith("http")) {
                    imageUrl = baseUrl + imageUrl;
                }

                products.push({
                    name: productName,
                    price: price,
                    stock: 10,
                    description: description || "No description available",
                    imageUrl: imageUrl ? imageUrl : null,
                    productUrl: productUrl ? productUrl : null,
                });
            } catch (error) {
                console.error(
                    `Error scraping product details from ${productLink}:`,
                    error
                );
            }
        }

        fs.writeFileSync("scrapedData.json", JSON.stringify(products, null, 2));
        console.log("Scraping complete. Data saved to scrapedData.json");
    } catch (error) {
        console.error("Error scraping the site:", error);
    }
}

runScraping();
