import {
  LineItem as LItem,
  LineItemsService,
} from '../../service/lineItems.service';
import { TabService } from '../../service/tab.service';
import { BottomBar } from '../BottomBar';
import { BottomBarButton } from '../BottomBarButton';
import { LineItem } from '../LineItem';
import { Box, Divider } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import React, {
  FunctionComponent,
  ReactElement,
  useEffect,
  useMemo,
  useState,
} from 'react';

const useStyles = makeStyles((/*theme*/) => ({
  root: {
    // was just manually tested in Chrome, no fancy calculations
    height: '536px',
    '& .lineItemsHolder': {
      // this is just to offset the header and keep the sticky to the bottom if not enough items are added
      minHeight: '468px',
      height: '468px',
      overflowY: 'scroll',
    },
  },
}));

/**
 * Board of line items that we will run against to group Chrome tabs
 */
export const Board: FunctionComponent = (): ReactElement => {
  const classes = useStyles();
  const lineItemsService: LineItemsService = useMemo(
    () => new LineItemsService(),
    []
  );

  const tabService: TabService = new TabService();
  const [lineItems, setLineItems] = useState<LItem[]>([]);

  useEffect(() => {
    (async () => {
      const lineItems = await lineItemsService.get();
      setLineItems(lineItems);
    })();

    return () => {
      // unmount
    };
  }, [lineItemsService]);

  /**
   * Proceed to run grouping
   */
  const run = async () => {
    // todo shadow var?
    let lineItems = await lineItemsService.get();
    // immediately filter where apply is true, we ignore otherwise
    lineItems = lineItems.filter((i) => i.applyChanges);

    for (let item of lineItems) {
      const regex = item.regex;
      const { caseSensitive } = item;
      const returned: chrome.tabs.Tab[] = await tabService.getTabsWhichMatch(
        item.text,
        item.matchType,
        caseSensitive,
        regex
      );
      // if id for some reason is undefined, we return -1
      // not exactly sure what would happen there if an error is thrown or it continues if trying to add
      // -1 tab to a group
      const ids: number[] = returned.map((i) => (i.id ? i.id : -1));
      if (ids.length) {
        const color = item.color !== '' ? item.color : undefined;
        await tabService.addTabsToGroup(ids, item.groupTitle, color);
      }
    }
  };

  const cleanUp = async (): Promise<void> => {
    const lineItems = await lineItemsService.cleanUpLineItems();
    setLineItems(lineItems);
  };

  const addLineItem = async () => {
    const lineItems = await lineItemsService.add();
    setLineItems(lineItems);
  };

  const deleteLineItem = async (lineItemUniqueId: number): Promise<void> => {
    const lineItems = await lineItemsService.deleteLineItemById(
      lineItemUniqueId
    );
    setLineItems(lineItems);
  };

  const handleLineItemChange = async (
    lineItemUniqueId: number,
    lineItemState: LItem
  ) => {
    const lineItems = await lineItemsService.updateLineItems(
      lineItemUniqueId,
      lineItemState
    );
    setLineItems(lineItems);
  };

  return (
    <Box className={classes.root}>
      <Box className="lineItemsHolder">
        {lineItems.map((data, idx) => (
          <Box key={data.id}>
            <Box p={2} className="line-item">
              <LineItem
                onLineItemChange={(d: LItem) =>
                  handleLineItemChange(data.id, d)
                }
                deleteLineItem={deleteLineItem}
                {...data}
              />
            </Box>
            {lineItems.length - 1 !== idx && <Divider light />}
          </Box>
        ))}
      </Box>
      <BottomBar>
        <BottomBarButton onClick={addLineItem} tooltip="Adds a new line item">
          Add Item
        </BottomBarButton>
        <BottomBarButton
          onClick={run}
          tooltip="Runs one by one through the line items that you have set above"
        >
          Run
        </BottomBarButton>
        <BottomBarButton
          onClick={cleanUp}
          tooltip="Removes items that are the default for quick removal"
        >
          Clean up
        </BottomBarButton>
        <BottomBarButton
          onClick={() => tabService.sortGroups()}
          tooltip="Sort groups"
        >
          Sort Groups
        </BottomBarButton>
        <BottomBarButton
          onClick={() => tabService.clearGroups()}
          tooltip="Clears all groups in your browser"
        >
          Clear Groups
        </BottomBarButton>
      </BottomBar>
    </Box>
  );
};

Board.defaultProps = {};
