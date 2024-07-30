const cheerio = require("cheerio");
const axios = require("axios");
const fs = require("fs");

async function scrapedData() {
    try {
        // const baseUrl = "https://sunhillpure.com";
        const urls = [
            "https://sunhillpure.com/product-category/chia/",
            "https://sunhillpure.com/product-category/dry-fruits/",
            "https://sunhillpure.com/product-category/halwa/",
            "https://sunhillpure.com/product-category/seeds/",
            "https://sunhillpure.com/product-category/superfood/",
            "https://sunhillpure.com/product-category/sweets/"
        ];

        const allProducts = [];

        for (const url of urls) {
            const response = await axios.get(url);
            const $ = cheerio.load(response.data);

            $("div.product-grid-item").each((index, element) => {
                const productUrl = $(element).find("a.product-image-link").attr("href");
                const name = $(element).find("h3.wd-entities-title a").text().trim();
                const price = $(element).find(".price ins .woocommerce-Price-amount").text().trim() || $(element).find(".price .woocommerce-Price-amount").first().text().trim();
                const description = $(element).find(".hover-content-inner").text().trim();
                const imageUrl = $(element).find("a img").attr("src");
                console.log("🚀 ~ $ ~ imageUrl:", imageUrl)
                if (productUrl) {
                    allProducts.push({
                        name: name,
                        price: price,
                        stock: 10,
                        discription: description,
                        imageUrl: imageUrl ? imageUrl : null,
                        productUrl: productUrl
                    });
                }
            });
        }
        fs.writeFileSync('scraped_data.json', JSON.stringify(allProducts, null, 2));
    } catch (error) {
        console.log(error);
    }
}

scrapedData();
