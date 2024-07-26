const cheerio = require("cheerio");
const axios = require("axios");
const fs = require("fs");

async function runScraping() {
    try {
        const baseUrl = "https://surkhabfoods.com/collections/best-sellers";
        // const URL = `${baseUrl}/collections/best-sellers`;
        const response = await axios.get(baseUrl);
        const $ = cheerio.load(response.data);

        const allProductLinks = [];
        $("div.grid div.grid__item div.grid-product__image-wrapper a").each(
            (index, element) => {
                const link = $(element).attr("href");
                if (link) {
                    const absoluteLink = new URL(link, baseUrl).href;
                    allProductLinks.push(absoluteLink);
                }
                console.log(allProductLinks, "<-------");
            }
        );

        const allProducts = [];

        for (const productLink of allProductLinks) {
            try {
                const productResponse = await axios.get(productLink);
                const $ = cheerio.load(productResponse.data);

                const productUrl = productLink;
                const productName = $("h1.product-single__title").text().trim();
                const price = $("span.money").first().text().trim();
                const description = $("div.product-single__description p")
                    .text()
                    .trim();
                const imagediv = $("div.product-thumbnail-wrapper").first();
                const imageUrl = $(imagediv).find("img").attr("data-src");
                const width = 500;
                const height = 500;
                const imgUrl = imageUrl
                    .replace("{width}", width)
                    .replace("{height}", height);
                // const imageUrl = imagediv.find("img").attr("srcset").split(" ")[0];
                // console.log($(imagediv).html(), "tyfywdguy");
                allProducts.push({
                    name: productName,
                    price: price,
                    stock: 10,
                    description: description,
                    //   imageUrl: imageUrl ? imageUrl : null,
                    imageUrl: imgUrl ? "https:" + imgUrl : null,
                    productUrl: productUrl ? productUrl : null,
                });
            } catch (error) {
                console.error(
                    `Error scraping product details from ${productLink}:`,
                    error.message
                );
            }
        }

        fs.writeFileSync("scrapedData.json", JSON.stringify(allProducts, null, 2));
        console.log("Scraping complete. Data saved to scrapedData.json");
    } catch (error) {
        console.error("Error scraping the site:", error.message);
    }
}

runScraping();
