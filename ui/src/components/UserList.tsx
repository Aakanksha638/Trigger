// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from 'react'
import { Icon, List } from 'semantic-ui-react'
import { Party } from '@daml/types';
import { User } from '@daml.js/trigger';

type Props = {
  users: User.User[];
  partyToAlias: Map<Party, string>;
  onFollow: (userToFollow: Party) => void;
}

/**
 * React component to display a list of `User`s.
 * Every party in the list can be added as a friend.
 */
const UserList: React.FC<Props> = ({users, partyToAlias, onFollow}) => {
  return (
    <List divided relaxed>
      {[...users].sort((x, y) => x.username.localeCompare(y.username)).map(user =>
        <List.Item key={user.username}>
          <List.Icon name='user' />
          <List.Content>
            <List.Content floated='right'>
              <Icon
                name='add user'
                link
                className='test-select-add-user-icon'
                onClick={() => onFollow(user.username)} />
            </List.Content>
            <List.Header className='test-select-user-in-network'>{partyToAlias.get(user.username) ?? user.username}</List.Header>
          </List.Content>
          <List.List>
            {[...user.following].sort((x, y) => x.localeCompare(y)).map(userToFollow =>
              <List.Item key={userToFollow}>
                <List.Content floated='right'>
                  <Icon
                    name='add user'
                    link
                    className='test-select-add-user-following-icon'
                    onClick={() => onFollow(userToFollow)} />
                </List.Content>
                <List.Icon name='user outline' />
                <List.Content>
                  <List.Header>{partyToAlias.get(userToFollow) ?? userToFollow} </List.Header>
                </List.Content>
              </List.Item>
            )}
          </List.List>
        </List.Item>
      )}
    </List>
  );
};

export default UserList;
