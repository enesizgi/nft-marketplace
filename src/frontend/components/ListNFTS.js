import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const ListNFTSPage = ({ marketplace, nft, account }) => {
  const [loading, setLoading] = useState(true)
  const [listedItems, setListedItems] = useState([])
  const [soldItems, setSoldItems] = useState([])
  const loadListedItems = async () => {
    // Load all sold items that the user listed
    const itemCount = await marketplace.itemCount()
    let listedItems = []
    let soldItems = []
    for (let indx = 1; indx <= itemCount; indx++) {
      const i = await marketplace.items(indx)
      if (i.seller.toLowerCase() === account) {
        // get uri url from nft contract
        const uri = await nft.tokenURI(i.tokenId)
        // use uri to fetch the nft metadata stored on ipfs
        const response = await fetch(`http://localhost:3001/get-from-ipfs?cid=${uri}`)
        const metadata = await response.json()
        // get total price of item (item price + fee)
        const totalPrice = await marketplace.getTotalPrice(i.itemId)
        // define listed item object
        let item = {
          totalPrice,
          price: i.price,
          itemId: i.itemId,
          name: metadata.data.name,
          description: metadata.data.description,
          image: metadata.data.image
        }
        listedItems.push(item)
        // Add listed item to sold items array if sold
        if (i.sold) soldItems.push(item)
      }
    }
    setLoading(false)
    setListedItems(listedItems)
    setSoldItems(soldItems)
  }
  useEffect(() => {
    loadListedItems()
  }, [])
  if (loading) return (
    <main style={{ padding: "1rem 0" }}>
      <h2>Loading...</h2>
    </main>
  )
  return (
    <div className='imageContainer'>
      {listedItems.map((item, idx) => (
        <div key={`${item.image}-${Math.random()}`} className='imageItem'>
          {item.image && <img src={`data:${item.image.data.mimetype};base64,${item.image.data.data}`} width='300px' />}
          <div className='imageItemInfo'>
            <div className='imageItemName'>Name: {item.name}</div>
            <div className='imageItemDescription'>Description: {item.description}</div>
            <div className='imageItemPrice'>Price: {ethers.utils.formatEther(item.totalPrice)} ETH</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ListNFTSPage;