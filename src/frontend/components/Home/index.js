import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { fetchWithTimeout } from '../utils'

const HomePage = ({ marketplace, nft }) => {
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState([])
  const loadMarketplaceItems = async () => {
    // Load all unsold items
    const itemCount = await marketplace.itemCount()
    let items = []
    for (let i = 1; i <= itemCount; i++) {
      const item = await marketplace.items(i)
      try {
        if (!item.sold) {
          // get uri url from nft contract
          const uri = await nft.tokenURI(item.tokenId)
          // use uri to fetch the nft metadata stored on ipfs
          const response = await fetchWithTimeout(`http://localhost:3001/get-from-ipfs?cid=${uri}`, { timeout: 3000 })
          const metadata = await response.json()
          // get total price of item (item price + fee)
          const totalPrice = await marketplace.getTotalPrice(item.itemId)
          // Add item to items array
          items.push({
            totalPrice,
            itemId: item.itemId,
            seller: item.seller,
            name: metadata.data.name,
            description: metadata.data.description,
            image: metadata.data.image
          })
        }
      }
      catch (e) {
        console.log(e)
      }
    }
    setLoading(false)
    setItems(items)
  }

  const buyMarketItem = async (item) => {
    await (await marketplace.purchaseItem(item.itemId, { value: item.totalPrice })).wait()
    loadMarketplaceItems()
  }

  useEffect(() => {
    loadMarketplaceItems()
  }, [])

  if (loading) return (
    <h2>Loading...</h2>
  )
  if (items.length > 0) {
    return (
      <div className='imageContainer'>
        {items.map((item, idx) => (
          <div key={`${item.image}-${Math.random()}`} className='imageItem'>
            {item.image && <img src={`data:${item.image.data.mimetype};base64,${item.image.data.data}`} width='300px' />}
            <div className='imageItemInfo'>
              <div className='imageItemName'>Name: {item.name}</div>
              <div className='imageItemDescription'>Description: {item.description}</div>
              <button onClick={() => buyMarketItem(item)}>Buy for {ethers.utils.formatEther(item.totalPrice)} ETH</button>
            </div>
          </div>
          ))}
      </div>
    );
  }
  return <div>Home</div>;
}

export default HomePage;