var search = require('./search.js')
var analysis = require('./analysis.js')


var stock = search.getStock("AMZN", (error, stock) => {
    console.log(error + stock)
})