const cheerio = require("cheerio");
const axios = require("axios");
const fs = require("fs");

async function runScraping() {
    try {

        const URL = "https://www.hunzabucket.com/shop/";
        const response = await axios.get(URL);
        const $ = cheerio.load(response.data);

        const allProductLinks = [];
        // const baseUrl = "https://www.hunzabucket.com/";

        // Collect all product links
        // console.log("tayyab is here: ")
        $("ul div.product-thumb-hover a div.img-thumbnail a img-thumbnail").each((index, element) => {
            const link = "https://www.hunzabucket.com/" + $(element).attr("href");
            allProductLinks.push(link);
            console.log("🚀 ~ $ ~ link:", link);
        });
        // const products = [];
        fs.writeFileSync("scrapedData.json", JSON.stringify(allProductLinks, null, 2));

        // Scrape each product link for details
        // for (const productLink of allProductLinks) {
        //     try {
        //         const productResponse = await axios.get(productLink);
        //         const $ = cheerio.load(productResponse.data);

        //         const productName = $("h1.product_title")
        //             .text()
        //             .replace(/\s+/g, " ")
        //             .trim();
        //         const price = $("div.entry-summary span.woocommerce-Price-currencySymbol")
        //             .text()
        //             .replace(/\s+/g, " ")
        //             .trim();
        //         const description = $("div.entry-summary div.description p")
        //             .text()
        //             .replace(/\s+/g, " ")
        //             .trim();

        //         // Handle image URL extraction
        //         const imgElement = $("div.slick-list img");
        //         let imageUrl =
        //             imgElement.attr("src");

        //         products.push({
        //             name: productName,
        //             price: price,
        //             description: description,
        //             imageUrl: imageUrl ? imageUrl : null,
        //         });

        //     } catch (error) {
        //         console.error(
        //             `Error scraping product details from ${productLink}:`,
        //             error
        //         );
        //     }
        // }

        // fs.writeFileSync("scrapedData.json", JSON.stringify(products, null, 2));
        // console.log("Scraping complete. Data saved to scrapedData.json");

    } catch (error) {
        console.error("Error scraping the site:", error);
    }
}

runScraping();
