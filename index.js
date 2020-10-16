var search = require('./search.js')
var analysis = require('./analysis.js')

// stock_name = (string) name of stock
function analysisQuery (stock_name) {
    
    var stock = search.getStock(stock_name, (error, stock) => {
        console.log("\n Asking About "+stock_name+".. \n")
        //console.log(error, stock)
    
        console.log("\nResponse Chosen:  ", analysis.reviewStock(stock), "\n\n")
    })
}



//analysisQuery("APPL")

analysisQuery("MSFT")


analysisQuery("CVX")