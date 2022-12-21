import React, { useState } from 'react';
import { TiArrowSortedUp, TiArrowSortedDown } from 'react-icons/ti';
import './NFTDetailActivity.css';

// TODO: Add redux

// eslint-disable-next-line no-unused-vars
const NFTDetailActivity = ({ item, transactions }) => {
  const [open, setOpen] = useState(false);
  console.log(transactions);
  const openItemActivity = () => {
    setOpen(!open);
  };
  // TODO reuse detail box component
  return (
    <section className="nft-item-activity-container">
      <div className="box-container">
        <div className="box-panel-activity">
          <button type="button" className="box-button" onClick={openItemActivity}>
            <span>Item Activity</span>
            <div className="up-down-icon">{open ? <TiArrowSortedUp /> : <TiArrowSortedDown />}</div>
          </button>
          {open && (
            <div className="panel-body">
              <div className="event-history">
                <div className="scroll-box">
                  <div className="event-header" role="row">
                    <div className="event-header-item event-type">Event</div>
                    <div className="event-header-item price">Price</div>
                    <div className="event-header-item">From</div>
                    <div className="event-header-item">To</div>
                  </div>
                  {transactions &&
                    transactions.map(transaction => {
                      const p = transaction.price;
                      return (
                        <div className="event" role="row">
                          <div className="event-cell event-type">
                            {transaction.type === 0 && <span>Minted</span>}
                            {transaction.type === 1 && <span>Transfer</span>}
                            {transaction.type === 2 && <span>Sale</span>}
                          </div>

                          <div className="event-cell price">{p && <span>{p} ETH</span>}</div>

                          <div className="event-cell">
                            <span>{transaction.from === 0 ? 'Null' : transaction.from.slice(0, 5)}</span>
                          </div>

                          <div className="event-cell">
                            <span>{transaction.to.slice(0, 5)}</span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default NFTDetailActivity;
