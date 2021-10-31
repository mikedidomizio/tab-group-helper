import packageJSON from '../../../../../package.json';
import { Box, Link, List, ListItem, Typography } from '@material-ui/core';
import React, { FunctionComponent, MouseEvent, ReactElement } from 'react';

/**
 * Help page
 */
export const Help: FunctionComponent<any> = (): ReactElement => {
  const openLink = (evt: MouseEvent<HTMLElement>) => {
    evt.preventDefault();
    // @ts-ignore
    chrome.tabs.create({ url: evt.target.getAttribute('href') });
  };

  return (
    <Box p={2}>
      <Box>
        <Typography variant="h6">Information</Typography>
        <List aria-label="Information">
          <ListItem>
            <Typography variant="body2">
              Version: {packageJSON.version}
            </Typography>
          </ListItem>
        </List>
      </Box>
      <Box>
        <Typography variant="h6">Links</Typography>
        <List aria-label="Links">
          <ListItem>
            <Link
              variant="body2"
              href={packageJSON.repository.url}
              onClick={openLink}
            >
              GitHub page
            </Link>
          </ListItem>
          <ListItem>
            <Link
              variant="body2"
              href="https://chrome.google.com/webstore/detail/tab-group-helper/llhkcebnebfiaamifhbpehjompplpnae"
              onClick={openLink}
            >
              Chrome Web Store link
            </Link>
          </ListItem>
          <ListItem>
            <Link variant="body2" href="pages/general.html" onClick={openLink}>
              General/Help page with instructions
            </Link>
          </ListItem>
        </List>
      </Box>
    </Box>
  );
};
