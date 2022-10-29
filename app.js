const BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = "api_key=1cf50e6248dc270629e802686245c2c8";
const API_URL = BASE_URL + "/discover/movie?sort_by=popularity.desc&" + "";
const searchURL = BASE_URL + "/search/movie?" + "";
const movieURL = BASE_URL + "/movie";

const apiSimilarURL = "https://tastedive.com/api/similar";

const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");
const PORT = process.env.PORT || 8080;

// const localtunnel = require('localtunnel');

// const tunnel = localtunnel(PORT, { subdomain: 'movie'} ,(err, tunnel) => {
//     let a=3;
//     console.log(tunnel)
// });

const app = express();
const corsOptions = {
  // origin: "http://localhost:3000",
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.static(__dirname + "/build"));
app.use(express.json());

app.post("/movieData", async (req, res) => {
  const { data, includeKey, type, page } = req.body;
  let url = "";
  const arrRes = [];
  if (includeKey === false) {
    url = API_URL + API_KEY;
    url += "&page=" + page;
  } else {
    if (type === "discover") {
      // data is array of genres: array of strings
      url =
        API_URL + "with_genres=" + encodeURI(data.join(",")) + "&" + API_KEY;
      url += "&page=" + page;
    } else if (type === "search") {
      //data is the search term : strings
      url = searchURL + "query=" + data + "&" + API_KEY;
      url += "&page=" + page;
    } else if (type === "similar") {
      // //data is the object containing title and ID
      // console.log('similar   data:',data)

      // // url=movieURL+`/${data}`+"/similar"+"?"+API_KEY;
      // url=movieURL+`/${data}`+"/recommendations"+"?"+API_KEY;
      // url+='&page='+page
      // console.log("selectedMovieIDTitle: ", data);
      url =
        apiSimilarURL +
        "?q=" +
        encodeURI(data.selectedMovieIDTitle) +
        "&type=movies";
      
       let obj={};
       try{
        const res12 = await fetch(url);
      obj = await res12.json();
       } 
       catch(err){
        console.log('err tastedive: ',err)
       }
      
      console.log("obj Similar:", obj.Similar.Results);
      const SimilarArray = obj.Similar.Results;
      const SimilarNames = SimilarArray.map((similar) => similar.Name);
      console.log("similar names: ", SimilarNames);

      const SimilarNamesPromises = SimilarNames.map(async(name) => {
        let url2 = searchURL + "query=" + name + "&" + API_KEY;
        try{
          return await fetch(url2);  
        }
        catch(err){
          process.exit(1)
          console.log('await fetch map err: ',err)
        }
        
      });

      for await (let request of SimilarNamesPromises) {
        try{
          const result = await request.json();
        // console.log(result.results[0])
        arrRes.push(result.results[0]);  
        }
        catch(err){
          process.exit(1)
          console.log('err similar: ',err)
        }
        
      }

      // for(name of SimilarNames)
      // {
      //   let url2 = searchURL + "query=" + name + "&" + API_KEY;
      //   const res2=await fetch(url2);
      //   const obj2=await res.json()
      //   console.log(obj)

      // }
    }
  }

  console.log("posted url: ", url);

  try{
    if (type !== "similar")
    {
       const res3 = await fetch(url);
  const data2 = await res3.json();
  console.log("data: ", data2);
   res.json(data2);
    }
   
  else{
   res.json({ results: arrRes });
  }
  }
  catch(err){
    process.exit(1)
    console.log('err: ',err)
  }
  
  // fetch(url)
  // .then((res) => res.json())
  // .then((data) => {
  //   // if(type==="similar")
  //   //   console.log(data);

  //   res.json(data);
  // });
});

app.listen(process.env.PORT || PORT, () => {
  console.log("app is running at port ", PORT);
});
