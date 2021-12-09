// @ts-ignore
import { runGrouping } from '../../../Background/run-grouping';
import {
  LineItem as LItem,
  LineItemsService,
} from '../../service/lineItems.service';
import { TabService } from '../../service/tab.service';
import { BottomBar } from '../BottomBar';
import { BottomBarButton } from '../BottomBarButton';
import { LineItem } from '../LineItem';
import { Box, Divider } from '@material-ui/core';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import DeleteSweepIcon from '@material-ui/icons/DeleteSweep';
import LayersClearIcon from '@material-ui/icons/LayersClear';
import PlayCircleOutlineIcon from '@material-ui/icons/PlayCircleOutline';
import SortIcon from '@material-ui/icons/Sort';
import UnfoldLessIcon from '@material-ui/icons/UnfoldLess';
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
    }
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
  const handleLineItemMove = async (
    lineItemUniqueId: number,
    direction: 'up' | 'down'
  ) => {
    const lineItems = await lineItemsService.moveLineItem(
      lineItemUniqueId,
      direction
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
                moveLineItem={(id, direction) =>
                  handleLineItemMove(id, direction)
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
        <BottomBarButton
          isIconButton
          onClick={() => addLineItem()}
          tooltip="Adds a new rule"
        >
          <AddCircleOutlineIcon />
        </BottomBarButton>
        <BottomBarButton
          isIconButton
          onClick={() => runGrouping()}
          tooltip="Runs one by one through the rules that you have set above"
        >
          <PlayCircleOutlineIcon />
        </BottomBarButton>
        <BottomBarButton
          isIconButton
          onClick={() => cleanUp()}
          tooltip="Removes rules that are the default for quick removal"
        >
          <DeleteSweepIcon />
        </BottomBarButton>
        <BottomBarButton
          isIconButton
          onClick={() => tabService.sortGroups()}
          tooltip="Sort groups"
        >
          <SortIcon />
        </BottomBarButton>
        <BottomBarButton
          isIconButton
          onClick={() => tabService.collapseGroups(true)}
          tooltip="Collapse/Expand groups"
        >
          <UnfoldLessIcon />
        </BottomBarButton>
        <BottomBarButton
          isIconButton
          onClick={() => tabService.clearGroups()}
          tooltip="Clears all groups in your browser"
        >
          <LayersClearIcon />
        </BottomBarButton>
      </BottomBar>
    </Box>
  );
};

Board.defaultProps = {};
