const ytsearch = require("ytsearch-node")

const main = async() =>{
  let results = await ytsearch("Black Panther")
  
  console.log(results)

  
}
main()
