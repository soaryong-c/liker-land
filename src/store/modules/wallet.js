/* eslint no-param-reassign: "off" */

import {
  WALLET_SET_KEPLR_INSTALL_CTA_PRESET,
  WALLET_SET_COSMOSTATION_APP_WC2_ENABLED,
  WALLET_SET_ADDRESS,
  WALLET_SET_SIGNER,
  WALLET_SET_CONNECTOR,
  WALLET_SET_LIKERINFO,
  WALLET_SET_METHOD_TYPE,
  WALLET_LIKE_BALANCE,
} from '../mutation-types';

import * as getters from './getters/wallet';
import * as actions from './actions/wallet';

const state = () => ({
  keplrInstallCTAPreset: 'origin',
  cosmostationAppWC2Enabled: false,
  address: '',
  signer: null,
  connector: null,
  likerInfo: null,
  isInited: null,
  methodType: null,
  likeBalance: null,
});

const mutations = {
  [WALLET_SET_KEPLR_INSTALL_CTA_PRESET](state, preset) {
    state.keplrInstallCTAPreset = preset;
  },
  [WALLET_SET_COSMOSTATION_APP_WC2_ENABLED](state, isEnabled) {
    state.cosmostationAppWC2Enabled = isEnabled;
  },
  [WALLET_SET_ADDRESS](state, address) {
    state.address = address;
  },
  [WALLET_SET_SIGNER](state, signer) {
    state.signer = signer;
  },
  [WALLET_SET_METHOD_TYPE](state, method) {
    state.methodType = method;
  },
  [WALLET_SET_CONNECTOR](state, connector) {
    state.connector = connector;
  },
  [WALLET_SET_LIKERINFO](state, likerInfo) {
    state.likerInfo = likerInfo;
  },
  [WALLET_LIKE_BALANCE](state, likeBalance) {
    state.likeBalance = likeBalance;
  },
};

export default {
  actions,
  getters,
  state,
  mutations,
};
