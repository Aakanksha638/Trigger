// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useCallback, useEffect, useState } from 'react'
import { Image, Menu } from 'semantic-ui-react'
import MainView from './MainView';
import { User } from '@daml.js/trigger';
import { PublicParty } from '../Credentials';
import { userContext } from './App';

type Props = {
  onLogout: () => void;
  getPublicParty : () => PublicParty;
}

const toAlias = (userId: string): string =>
  userId.charAt(0).toUpperCase() + userId.slice(1);

/**
 * React component for the main screen of the `App`.
 */
const MainScreen: React.FC<Props> = ({onLogout, getPublicParty}) => {
  const user = userContext.useUser();
  const party = userContext.useParty();
  const {usePublicParty, setup} = getPublicParty();
  const setupMemo = useCallback(setup, [setup]);
  useEffect(setupMemo);
  const publicParty = usePublicParty();

  const ledger = userContext.useLedger();

  const [createdUser, setCreatedUser] = useState(false);
  const [createdAlias, setCreatedAlias] = useState(false);

  const createUserMemo = useCallback(async () => {
    try {
      let userContract = await ledger.fetchByKey(User.User, party);
      if (userContract === null) {
        const user = {username: party, following: []};
        userContract = await ledger.create(User.User, user);
      }
      setCreatedUser(true);
    } catch(error) {
      alert(`Unknown error:\n${JSON.stringify(error)}`);
    }
  }, [ledger, party]);

  const createAliasMemo = useCallback(async () => {
    if (publicParty) {
      try {
        let userAlias = await ledger.fetchByKey(User.Alias, {_1: party, _2: publicParty});
        if (userAlias === null) {
           await ledger.create(User.Alias, {username: party, alias: toAlias(user.userId), public: publicParty});
        }
      } catch(error) {
        alert(`Unknown error:\n${JSON.stringify(error)}`);
      }
      setCreatedAlias(true);
    }
  }, [ledger, user, publicParty, party]);

  useEffect(() => {createUserMemo();} , [createUserMemo])
  useEffect(() => {createAliasMemo();} , [createAliasMemo])

  if (!(createdUser && createdAlias)) {
    return <h1>Logging in...</h1>;
  } else {
    return (
      <>
        <Menu icon borderless>
          <Menu.Item>
            <Image
              as='a'
              href='https://www.digitalasset.com/developers'
              target='_blank'
              src='/daml.svg'
              alt='Daml Logo'
              size='mini'
            />
          </Menu.Item>
          <Menu.Menu position='right' className='test-select-main-menu'>
            <Menu.Item position='right'>
              You are logged in as {user.userId}.
            </Menu.Item>
            <Menu.Item
              position='right'
              active={false}
              className='test-select-log-out'
              onClick={onLogout}
              icon='log out'
            />
          </Menu.Menu>
        </Menu>
        <MainView />
      </>
    );
  }
};

export default MainScreen;
