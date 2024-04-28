const fetch= require('node-fetch')

const getSimilarMovies=async(input)=>{


	// const input="batman"
	const searchurl=`https://tastedive.com/api/search?query=${input}&take=9&page=1&searchCategory=default&types=urn:entity:artist,urn:entity:movie,urn:entity:tv_show,urn:entity:book,urn:entity:videogame,urn:entity:podcast,urn:entity:person,urn:entity:place,urn:entity:brand`


	try{
		
		const searchres=await fetch(searchurl)
		const searchdata= await searchres.json()

		// console.log('data :', searchdata)

		const entityID=searchdata.results?.[0]?.entity_id

		if(entityID){
			const similarurl= `https://tastedive.com/api/getRecsByCategory?page=1&entityId=${entityID}&category=movies&limit=18`
			const similarRes = await fetch(similarurl)
			const similarData= await similarRes.json()

			console.log('similarData: ',similarData)	

			return similarData


		}
		else{
			console.log('no entity_id')
		}
	}

	catch(err){

		// console.log('err: ', err)
		throw new Error(err)
	}

}

module.exports={getSimilarMovies}