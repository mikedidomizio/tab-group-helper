import { Board } from './components/pages/Board';
import { Edit } from './components/pages/Edit';
import { Help } from './components/pages/Help';
import { LineItemsService } from './service/lineItems.service';
import { createMemoryHistory } from 'history';
import { useEffect, useState } from 'react';
import { Header } from './components/Header';

// leave outside the app to continue working
const history = createMemoryHistory();

export const App = () => {
  // to force the rerender, we use this state variable to make the rerender happen
  const [path, setPath] = useState('/')

  useEffect(() => {
    (async () => {
      // this is a backwards compatibility workaround (hack) to move localStorage to sessionStorage so line items aren't removed
      // this can probably be removed in a few months
      const storageKey = 'lineItems';
      const lineItemsFromLocalStorage = localStorage.getItem(storageKey);
      if (lineItemsFromLocalStorage) {
        const items = JSON.parse(lineItemsFromLocalStorage);
        const lineItemsService = new LineItemsService();
        const lineItems = await lineItemsService.get();

        // it's safe to say the session storage has never been set, therefore we will set it from localStorage
        if (lineItems[0].text === '' && lineItems[0].groupTitle === '') {
          await lineItemsService.set(items);
          localStorage.removeItem(storageKey);
        }
      }
    })();

    return () => {
      // unmount
    };
  }, []);

  const handleOnMenuItemClick =(url) => {
    history.push(url);
    setPath(url);
  };

  return (
    <div className="App">
      <Header onMenuItemClick={handleOnMenuItemClick}/>
      {path === '/edit' && <Edit />}
      {path === '/help' && <Help />}
      {path === '/' && <Board />}
    </div>
  );
};
