import { LineItem, LineItemsService } from '../../service/lineItems.service';
import { BottomBar } from '../BottomBar';
import { BottomBarButton } from '../BottomBarButton';
import { Box, TextField, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Check, ErrorOutline } from '@material-ui/icons';
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

/**
 * Edit line items manually
 */
export const Edit: FunctionComponent = (): ReactElement => {
  const lineItemsService = useMemo(() => new LineItemsService(), []);
  const classes = useStyles();
  const [state, setState] = useState<{
    error: string | null;
    textFieldValue: string;
  }>({ error: null, textFieldValue: '' });
  let defaultClipboardButtonText = 'Copy to Clipboard';
  // first value is the button text, second value is true for success copied, false for error, null for nothing
  const [clipboardButtonText, setClipboardButtonText] = useState<
    [string, boolean | null]
  >([defaultClipboardButtonText, null]);

  useEffect(() => {
    let interval: any;

    if (clipboardButtonText[0] !== defaultClipboardButtonText) {
      interval = setTimeout(() => {
        setClipboardButtonText([defaultClipboardButtonText, null]);
      }, 3000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [clipboardButtonText, defaultClipboardButtonText]);

  useEffect(() => {
    (async () =>
      setState({ textFieldValue: await getJsonTextField(), error: null }))();

    return () => {
      // unmount
    };
    // todo specifying getJsonTextField as a dependency for this useEffect holds up the test suite
  }, []);

  const getJsonTextField = async (): Promise<string> => {
    const lineItems = await lineItemsService.get();
    return JSON.stringify(lineItems, undefined, 4);
  };

  const handleChange = async (
    evt: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): Promise<void> => {
    const textFieldValue = evt.target.value;

    try {
      const parsed = JSON.parse(textFieldValue);
      if (!hasDuplicateIds(parsed)) {
        setState({ error: null, textFieldValue });
        setClipboardButtonText([defaultClipboardButtonText, null]);
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

  const reset = async (): Promise<void> => {
    setState({ textFieldValue: await getJsonTextField(), error: null });
  };

  const beautify = async (): Promise<void> => {
    if (!state.error) {
      setState({ textFieldValue: await getJsonTextField(), error: null });
    }
  };

  const copyToClipboard = () => {
    if (!state.error) {
      try {
        navigator.clipboard.writeText(state.textFieldValue);
        setClipboardButtonText(['Copied', true]);
        return;
      } catch (e) {
        // below will set the error since we have a return
      }
    }
    setClipboardButtonText(['Error', false]);
  };

  const endIcon = () => {
    if (clipboardButtonText[0] !== defaultClipboardButtonText) {
      if (clipboardButtonText[1]) {
        return <Check />;
      }
      return <ErrorOutline />;
    }
    return null;
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
        <BottomBarButton
          onClick={copyToClipboard}
          tooltip="Copy the valid JSON to clipboard"
          endIcon={endIcon()}
        >
          {clipboardButtonText[0]}
        </BottomBarButton>
      </BottomBar>
    </Box>
  );
};
