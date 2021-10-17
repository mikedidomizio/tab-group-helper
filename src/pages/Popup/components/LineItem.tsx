import {
  ChromeTabsAttributes,
  LineItem as LItem,
} from '../service/lineItems.service';
import { TabService } from '../service/tab.service';
import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Tooltip,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import DeleteIcon from '@material-ui/icons/Delete';
import React, {
  ChangeEvent,
  FunctionComponent,
  ReactElement,
  SetStateAction,
  useEffect,
  useState,
} from 'react';

const useStyles = makeStyles((theme) => ({
  root: {
    '& .MuiTextField-root': {},
    '& .MuiSelect-root': {
      width: '60px',
    },
    '& .MuiFormGroup-root:not(:last-child)': {
      marginBottom: theme.spacing(2),
    },
    '& .MuiFormControl-root': {
      marginRight: theme.spacing(1),
    },
  },
}));

export interface LineItemProps extends LItem {
  /**
   * Calls parent to delete remove
   */
  deleteLineItem: (args: number) => void;
  /**
   * On prop change, it calls the parent component
   */
  onLineItemChange: (args: LItem) => void;
}

const defaultProps: LItem = {
  applyChanges: true,
  autoGroup: false,
  caseSensitive: false,
  color: '',
  groupTitle: '',
  id: -1,
  matchType: ChromeTabsAttributes.url,
  regex: true,
  text: '',
};

const CheckBox = (
  label: string,
  inputVame: string,
  val: boolean,
  handleChange: Function
) => {
  return (
    <FormControlLabel
      control={
        <Checkbox
          checked={val}
          onChange={(evt: ChangeEvent<any>) => handleChange(evt, 'checked')}
          name={inputVame}
          color="primary"
        />
      }
      label={label}
    />
  );
};

const Textfield = (
  label: string,
  inputName: string,
  value: string,
  handleChange: Function
) => {
  return (
    <TextField
      required
      name={inputName}
      onChange={(evt: ChangeEvent<any>) => handleChange(evt, 'value')}
      label={label}
      autoComplete="off"
      spellCheck="false"
      value={value}
    />
  );
};

const SelectTemplate = (
  idName: string,
  label: string,
  labelId: string,
  value: string,
  dropdownOptions: { k: string; v: string }[],
  handleChange: Function
) => {
  const menuItems = dropdownOptions.map((i) => {
    const label = i.v === '' ? 'none' : i.v;
    return (
      <MenuItem key={i.k} value={i.k}>
        {label}
      </MenuItem>
    );
  });

  return (
    <FormControl>
      <InputLabel id={idName}>{label}</InputLabel>
      <Select
        labelId={labelId}
        id={idName}
        label={labelId}
        name={idName}
        onChange={(evt: ChangeEvent<any>) => handleChange(evt, 'value')}
        value={value}
      >
        {menuItems}
      </Select>
    </FormControl>
  );
};

const tooltipTime = 5000;

/**
 * Line item for grouping Chrome tabs
 */
export const LineItem: FunctionComponent<LineItemProps> = ({
  applyChanges,
  autoGroup,
  caseSensitive,
  color,
  deleteLineItem,
  id,
  groupTitle,
  matchType,
  onLineItemChange,
  regex,
  text,
}: LineItemProps & typeof defaultProps): ReactElement => {
  const classes = useStyles();
  const colorOptions: Array<chrome.tabGroups.ColorEnum | ''> = [
    '',
    'grey',
    'blue',
    'red',
    'yellow',
    'green',
    'pink',
    'purple',
    'cyan',
  ];
  const [stateTabsMatched, setTabsMatchedState]: [
    chrome.tabs.Tab[],
    SetStateAction<any>
  ] = useState([]);

  const menuOptionsColors: { k: string; v: string }[] = colorOptions.map(
    (i) => {
      const label = i === '' ? 'none' : i;
      return {
        k: i,
        v: label,
      };
    }
  );

  const getTabsMatched = () => {
    if (stateTabsMatched.length === 0) {
      return <div>No matches</div>;
    }

    return stateTabsMatched.map((i: chrome.tabs.Tab) => {
      const val = (i as any)[matchType];
      return (
        <Box mb={1} key={i.id}>
          {val}
        </Box>
      );
    });
  };

  const checkMatches = async () => {
    // take the values and update the state/dom to show how many tabs are matched
    const tabsMatched = await new TabService().getTabsWhichMatch(
      text,
      matchType,
      caseSensitive,
      regex
    );
    if (tabsMatched.length !== stateTabsMatched.length) {
      setTabsMatchedState(tabsMatched);
    }
  };

  (async () => checkMatches())();
  // @ts-ignore
  useEffect(() => async () => await checkMatches(), [stateTabsMatched]); // eslint-disable-line react-hooks/exhaustive-deps

  const getLineItemValues = (): LItem => {
    return {
      applyChanges,
      autoGroup,
      caseSensitive,
      color,
      id,
      groupTitle,
      matchType,
      regex,
      text,
    };
  };

  /**
   * @param event
   * @param targetType which value to assign, which is different between text fields and checkboxes
   */
  const handleChange = (
    event: ChangeEvent<any>,
    targetType: 'value' | 'checked'
  ) => {
    onLineItemChange(
      Object.assign(getLineItemValues(), {
        [event.target.name]: event.target[targetType],
      })
    );
  };

  return (
    <div className={classes.root}>
      <FormGroup row>
        <Tooltip
          title="What attribute to match"
          enterDelay={tooltipTime}
          leaveDelay={0}
        >
          {SelectTemplate(
            'matchType',
            'Type',
            'Match Type',
            matchType,
            [
              { k: 'url', v: 'URL' },
              {
                k: 'title',
                v: 'Title',
              },
            ],
            handleChange
          )}
        </Tooltip>
        <Tooltip
          title="The tab must contain the following"
          enterDelay={tooltipTime}
          leaveDelay={0}
        >
          {Textfield('Contains', 'text', text, handleChange)}
        </Tooltip>
        <Tooltip
          title="Whether it should match any case or have to be exact"
          enterDelay={tooltipTime}
          leaveDelay={0}
        >
          {CheckBox(
            'Case Sensitive',
            'caseSensitive',
            caseSensitive,
            handleChange
          )}
        </Tooltip>
        <Tooltip
          title="Enable matching by regular expression"
          enterDelay={tooltipTime}
          leaveDelay={0}
        >
          {CheckBox('Regex', 'regex', regex, handleChange)}
        </Tooltip>
      </FormGroup>
      <FormGroup className={classes.root} row>
        <Tooltip
          title="The name that the group will be given"
          enterDelay={tooltipTime}
          leaveDelay={0}
        >
          {Textfield('Group Name', 'groupTitle', groupTitle, handleChange)}
        </Tooltip>
        <Tooltip
          title="The Chrome group colour"
          enterDelay={tooltipTime}
          leaveDelay={0}
        >
          {SelectTemplate(
            'color',
            'Color',
            'color',
            color,
            menuOptionsColors,
            handleChange
          )}
        </Tooltip>
        <Tooltip
          title="Whether or not it should include this on 'Run'"
          enterDelay={tooltipTime}
          leaveDelay={0}
        >
          {CheckBox('Apply', 'applyChanges', applyChanges, handleChange)}
        </Tooltip>
        <Tooltip
          title="Will automatically group newly created tabs"
          enterDelay={tooltipTime}
          leaveDelay={0}
        >
          {CheckBox('Auto-Group', 'autoGroup', autoGroup, handleChange)}
        </Tooltip>
        <IconButton aria-label="delete" onClick={() => deleteLineItem(id)}>
          <DeleteIcon />
        </IconButton>
      </FormGroup>
      <FormGroup className={classes.root} row>
        <Tooltip title={getTabsMatched()} placement="bottom-start">
          <InputLabel>
            {`${stateTabsMatched.length} match`}
            {stateTabsMatched.length !== 1 && 'es'}
          </InputLabel>
        </Tooltip>
      </FormGroup>
    </div>
  );
};

LineItem.defaultProps = defaultProps;