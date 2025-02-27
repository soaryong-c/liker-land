<template lang="pug">
  Transition(
    name="error-dialog-"
    appear
  )
    DialogLayout.error-dialog
      template(
        v-if="isLoginErrorFromCivicLikerRegistration"
        #header-content
      )
        LikeButtonAnimation(
          class="-mt-32"
          :avatar="referrer ? referrer.avatar : undefined"
        )
      template(#body)
        Transition(
          name="error-dialog-content-"
          appear
        )
          main.page-content.error-dialog-content
            i18n.text-24.mt-16.font-600(
              v-if="isLoginErrorFromCivicLikerRegistration"
              :path="`ERROR.LOGIN_NEEDED_TO_SUPPORT_CREATOR${referrer ? '_WITH_NAME' : ''}`"
              tag="p"
            )
              span.whitespace-no-wrap(
                v-if="referrer"
                place="creator"
              ) {{ referrer.displayName }}

            template(v-else-if="formattedTitle")
              h1.text-28.mt-16.px-12 {{ formattedTitle }}
              p.text-16.mt-32.leading-1_5 {{ formattedMessage }}

            p.text-24.mt-16.font-600(v-else) {{ formattedMessage }}

            .mt-32.px-12(class="phone:px-0")
              div(v-if="isLoginError")
                a.btn.btn--outlined(
                  :href="getOAuthRegisterAPI"
                  @click="onClickLogEvent('Register', 'RegisterSignUp', 'RegisterSignUp(error page)', 1)"
                )
                  | {{ $t('signUp') }}

              div(v-if=`
                error.message === 'CIVIC_LIKER_TRIAL_EVENT_JOINED' ||
                error.message === 'CIVIC_LIKER_ALREADY_PAID'
              `)
                NuxtLink.btn.btn--outlined(:to="{ name: 'civic' }") {{ $t('learnMore') }}
                NuxtLink.btn.btn--outlined(
                  v-if="error.message === 'CIVIC_LIKER_TRIAL_EVENT_JOINED'"
                  :to="{ name: 'civic-register' }"
                )
                  | {{ $t('upgrade') }}

              // - Common action button
              - const btnClass = 'btn btn--plain btn--auto-size text-14 mx-0'

              template(v-else)
                a(
                  v-if="isLoginError"
                  class=btnClass
                  :href="getOAuthLoginAPI"
                  @click="onClickLogEvent('Register', 'RegisterSignIn', 'RegisterSignIn(error page)', 1)"
                )
                  | {{ $t('signIn') }}

                button(
                  v-if="!error.isBackButtonHidden"
                  class=btnClass
                  @click="onClickBackButton"
                )
                  | {{ $t('back') }}
</template>

<script>
import {
  getOAuthLoginAPI,
  getOAuthRegisterAPI,
  getUserMinAPI,
} from '~/util/api';
import { getAvatarHaloTypeFromUser, checkUserNameValid } from '~/util/user';
import { logTrackerEvent } from '~/util/EventLogger';
import { defaultLocale } from '~/locales';

import CrispMixin from '~/mixins/crisp';

import DialogLayout from '~/components/DialogLayout';
import Identity from '~/components/Identity/Identity';
import LikeButtonAnimation from '~/components/LikeButtonAnimation';

export default {
  layout: 'empty',
  transition: {
    name: '',
    css: false,
  },
  layoutTransition: {
    name: '',
    css: false,
  },
  components: {
    DialogLayout,
    Identity,
    LikeButtonAnimation,
  },
  mixins: [CrispMixin],
  props: {
    error: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      referrer: undefined,
    };
  },
  computed: {
    getOAuthLoginAPI() {
      const { utm_source: utmSource } = this.$route.query;
      return getOAuthLoginAPI({ language: this.$i18n.locale, utmSource });
    },

    getOAuthRegisterAPI() {
      const { from: qsID, referrer, utm_source: utmSource } = this.$route.query;
      const { id: paramID } = this.$route.params;
      return getOAuthRegisterAPI({
        language: this.$i18n.locale,
        from: qsID || paramID,
        referrer,
        utmSource,
      });
    },
    i18nKeyBase() {
      return `ERROR.${this.error.message}`;
    },
    i18nKeyTitle() {
      return `${this.i18nKeyBase}.title`;
    },
    i18nKeyMessage() {
      return `${this.i18nKeyBase}.message`;
    },
    isStringLocalizedError() {
      return this.$te(this.i18nKeyBase, defaultLocale);
    },
    isObjectLocalizedError() {
      return this.$te(this.i18nKeyMessage, defaultLocale);
    },
    isLoginError() {
      return /^LOGIN_NEEDED.*/.test(this.error.message);
    },
    isLoginErrorFromCivicLikerRegistration() {
      return this.isLoginError && /civic-register.*/.test(this.$route.name);
    },
    isCivicLikerRelatedError() {
      return /^CIVIC_LIKER.*/.test(this.error.message);
    },
    formattedTitle() {
      if (this.$te(this.i18nKeyTitle, defaultLocale)) {
        return this.$t(this.i18nKeyTitle);
      }
      return undefined;
    },
    formattedMessage() {
      if (this.isObjectLocalizedError) {
        return this.$t(this.i18nKeyMessage);
      }
      if (this.isStringLocalizedError) {
        return this.$t(this.i18nKeyBase);
      }
      if (this.isLoginError) {
        return this.$t('ERROR.LOGIN_NEEDED');
      }

      const { statusCode, message } = this.error;
      return `[${statusCode}] ${message}`;
    },
  },
  async mounted() {
    // HACK: to handle firebase function double decoding iscn id, causing route to fail
    if (this.$route.path.startsWith('/nft/iscn/iscn:/likecoin-chain')) {
      this.$router.replace({
        name: 'nft-iscn-iscnId',
        params: {
          iscnId: this.$route.path.replace('/nft/iscn/iscn:/', 'iscn://'),
        },
      });
      return;
    }

    if (this.isLoginError) {
      if (window.localStorage) {
        const { name, params, query, hash } = this.$route;
        window.localStorage.setItem(
          'USER_POST_AUTH_ROUTE',
          JSON.stringify({
            route: {
              name,
              params,
              query,
              hash,
            },
            ts: Date.now(),
          })
        );
      }
    }
    if (this.isLoginErrorFromCivicLikerRegistration) {
      // Fetch referrer info
      const { id: paramID } = this.$route.params;
      const { from: qsLikerID } = this.$route.query;
      const referrerID = paramID || qsLikerID;
      if (referrerID && checkUserNameValid(referrerID)) {
        try {
          const referrer = await this.$api.$get(getUserMinAPI(referrerID));
          this.referrer = {
            ...referrer,
            avatarHalo: getAvatarHaloTypeFromUser(referrer),
          };
        } catch (err) {
          const msg = (err.response && err.response.data) || err;
          // eslint-disable-next-line no-console
          console.error(msg);
        }
      }
    }
  },
  methods: {
    onClickBackButton() {
      // If the user enters a page requires authenication,
      // back button should trigger going back instead of refreshing the page
      if (this.isCivicLikerRelatedError) {
        this.$router.push({ name: 'civic' });
      } else if (this.isLoginError) {
        this.$router.back();
      } else {
        window.location.reload();
      }
    },
    onClickHomeButton() {
      if (this.$route.name === 'index') {
        window.location.reload();
      }
    },
    onClickLogEvent(...args) {
      logTrackerEvent(this, ...args);
    },
  },
  head() {
    return {
      title: this.formattedMessage,
    };
  },
};
</script>

<style lang="scss">
.error-dialog {
  z-index: 9999;

  @apply absolute;
  @apply inset-0;

  &-- {
    &enter,
    &leave-to {
      transform: translateY(4%);

      opacity: 0;
    }

    &enter-active,
    &leave-active {
      transition-duration: 0.5;
      transition-property: opacity, transform !important;
    }
    &enter-active {
      transition-timing-function: cubic-bezier(0, 0, 0.3, 1);
    }
    &leave-active {
      transition-timing-function: cubic-bezier(0.7, 0, 1, 1);
    }
  }

  &-content {
    &-- {
      &enter,
      &leave-to {
        transform: scale(0.95);

        opacity: 0;
      }

      &enter-active,
      &leave-active {
        transition-duration: 0.5s;
        transition-property: opacity, transform !important;
      }
      &enter-active {
        transition-timing-function: cubic-bezier(0, 0, 0.3, 1);
      }
      &leave-active {
        transition-timing-function: cubic-bezier(0.7, 0, 1, 1);
      }
    }
  }
}
</style>
