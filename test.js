const axios = require('axios');
const fs = require('fs');

const fetchAndSavePage = async () => {
  try {
    // Fetch the HTML of the page
    const { data } = await axios.get('https://en.macromicro.me/charts/30335/bitcoin-mvrv-zscore');
    
    // Save the HTML data to page.txt
    fs.writeFile('page.txt', data, (err) => {
      if (err) {
        console.error('Error writing to file:', err);
      } else {
        console.log('Saved to page.txt');
      }
    });
  } catch (error) {
    console.error('Error fetching page:', error);
  }
};

fetchAndSavePage();
