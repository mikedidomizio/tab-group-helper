import { LineItem, LineItemsService } from '../../service/lineItems.service';
import { BottomBar } from '../BottomBar';
import { BottomBarButton } from '../BottomBarButton';
import { Box, TextField, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Alert } from '@material-ui/lab';
import React, {
  ChangeEvent,
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
    '& .jsonHolder': {
      // this is just to offset the header and keep the sticky to the bottom if not enough items are added
      minHeight: '436px',
    },
  },
}));

export interface EditProps {
  /**
   * Error value that is displayed in the UI.  By default this text/value is not visible
   */
  error: string | null;
}

/**
 * Edit line items manually
 */
export const Edit: FunctionComponent<EditProps> = (): ReactElement => {
  const lineItemsService = useMemo(() => new LineItemsService(), []);
  const classes = useStyles();
  const [state, setState] = useState<{
    error: string | null;
    textFieldValue: string;
  }>({ error: null, textFieldValue: '' });

  useEffect(() => {
    (async () =>
      setState({ textFieldValue: await getJsonTextField(), error: null }))();

    return () => {
      // unmount
    };
  }, []);

  const handleChange = async (
    evt: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): Promise<void> => {
    const textFieldValue = evt.target.value;

    try {
      const parsed = JSON.parse(textFieldValue);
      if (!hasDuplicateIds(parsed)) {
        setState({ error: null, textFieldValue });
        await lineItemsService.set(parsed);
      } else {
        setState({
          error: 'Cannot have duplicate IDs. Did not save',
          textFieldValue,
        });
      }
    } catch (e) {
      setState({
        error: 'Issue with JSON below. Did not save',
        textFieldValue,
      });
    }
  };

  /**
   * Checks if a duplicate ID exists in the array
   * Useful if user manually copy/pastes to create a new line item
   * @param lineItems
   * @return {boolean}
   */
  const hasDuplicateIds = (lineItems: LineItem[]): boolean => {
    const ids = lineItems.map((i) => i.id);
    return new Set(ids).size !== ids.length;
  };

  const getJsonTextField = async (): Promise<string> => {
    const lineItems = await lineItemsService.get();
    return JSON.stringify(lineItems, undefined, 4);
  };

  const reset = async (): Promise<void> => {
    setState({ textFieldValue: await getJsonTextField(), error: null });
  };

  const beautify = async (): Promise<void> => {
    if (!state.error) {
      setState({ textFieldValue: await getJsonTextField(), error: null });
    }
  };

  return (
    <Box className={classes.root}>
      <Box className="jsonHolder" p={2}>
        <Box mb={1}>
          <Typography>Manually edit the JSON</Typography>
        </Box>
        {state.error && <Alert severity="error">{state.error}</Alert>}
        <TextField
          placeholder="JSON value of line items, edit with care"
          multiline
          minRows={1}
          fullWidth
          maxRows={20}
          spellCheck="false"
          value={state.textFieldValue}
          onChange={handleChange}
        />
      </Box>
      <BottomBar>
        <BottomBarButton
          onClick={reset}
          tooltip="When an error occurs, clicking this will reset it to the last saved/valid state"
        >
          Reset to last saved state
        </BottomBarButton>
        <BottomBarButton onClick={beautify} tooltip="Cleans up the JSON above">
          Beautify
        </BottomBarButton>
      </BottomBar>
    </Box>
  );
};

Edit.defaultProps = {
  error: null,
};
