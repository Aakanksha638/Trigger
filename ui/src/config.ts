// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { encode } from 'jwt-simple';
import { isRunningOnHub } from '@daml/hub-react';
import Ledger, { CanReadAs } from '@daml/ledger';

export type UserManagement = {
  tokenPayload: (loginName: string, ledgerId: string) => Object,
  primaryParty: (loginName: string, ledger: Ledger) => Promise<string>,
  publicParty: (loginName: string, ledger: Ledger) => Promise<string>,
};

export type Insecure = {
  provider: "none",
  userManagement: UserManagement,
  makeToken: (party: string) => string,
};

export type DamlHub = {
  provider: "daml-hub",
};

export type Authentication = Insecure | DamlHub;

export const userManagement: UserManagement = {
  tokenPayload: (loginName: string, ledgerId: string) =>
  ({
    sub: loginName,
    scope: "daml_ledger_api"
  }),
  primaryParty: async (loginName, ledger: Ledger) => {
    const user = await ledger.getUser();
    if (user.primaryParty !== undefined) {
      return user.primaryParty;
    } else {
      throw new Error(`User '${loginName}' has no primary party`);
    }

  },
  publicParty: async (loginName, ledger: Ledger) => {
    const rights = await ledger.listUserRights();
    const readAsRights: CanReadAs[] = rights.filter((x) : x is CanReadAs => x.type === "CanReadAs");
    if (readAsRights.length === 0) {
      throw new Error(`User '${loginName} has no readAs claims for a public party`);
    } else if (readAsRights.length > 1) {
      throw new Error(`User '${loginName} has readAs claims for more than one party`);
    } else {
      return readAsRights[0].party;
    }
  }
};

export const damlHub: DamlHub = {
  provider: "daml-hub",
};

export const insecure: Insecure = (() => {
  const ledgerId: string = process.env.REACT_APP_LEDGER_ID ?? "trigger-sandbox";
  return {
    provider: "none" as "none",
    userManagement: userManagement,
    makeToken: (loginName: string) => {
      const payload = userManagement.tokenPayload(loginName, ledgerId);
      return encode(payload, "secret", "HS256");
    }
  };
})();

export const authConfig: Authentication = (() =>
  isRunningOnHub() ? damlHub : insecure)();
