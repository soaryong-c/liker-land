<!-- eslint-disable vue/no-v-html -->
<template>
  <article class="get-app-page">
    <section class="screen-wrapper">
      <section class="container banner-container">
        <img class="feature-image" src="./getapp-banner.png">
        <img v-if="showCross" class="cross" src="./cross_3x.png">
      </section>
      <section class="container top-container">
        <div class="center app-logo">
          <img
            class="w-[160px]"
            src="~/assets/images/app-logo.svg"
          >
        </div>
        <h1 class="slogan center">
          <div class="slogan-text center">{{ $t('GetAppPage.Download') }}</div>
          <div class="slogan-text center">{{ $t('GetAppPage.Manage.like') }}</div>
        </h1>
      </section>
      <section class="container">
        <div class="download-badges">
          <div class="text-center">
            <AppDownloadBadges :from="from" v-bind="utmProps" />
          </div>
        </div>
      </section>
      <section class="container">
        <hr class="separate-line">
      </section>
      <section class="feature">
        <div>
          <div
            v-for="(feature, key) in combineFeatures"
            :key="key"
            class="container side-by-side"
          >
            <div class="icon-part">
              <img src="./phone_icon_3x.png" width="56px">
            </div>
            <div class="vp-part">
              <div class="main-vp">{{ feature.main }}</div>
              <div class="sub-vp">{{ feature.sub }}</div>
            </div>
          </div>
        </div>
      </section>
    </section>
  </article>
</template>

<script>
import AppDownloadBadges from '~/components/AppDownloadBadges/AppDownloadBadges';

export default {
  name: 'GetAppPageNew',
  components: {
    AppDownloadBadges,
  },
  props: {
    showCross: {
      type: Boolean,
      default: false,
    },
    width: {
      type: String,
      default: '160',
    },
    from: {
      type: String,
      default: '',
    },
    utmCampaign: {
      type: String,
      default: '',
    },
    utmMedium: {
      type: String,
      default: 'getapp_page',
    },
    utmSource: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      combinedVPs: [],
    };
  },
  computed: {
    combineFeatures() {
      const combinedVPs = [];
      for (let i = 0; i < this.$t('mainVPs').length; i += 1) {
        const singleVPPair = {
          main: this.$t('mainVPs')[i],
          sub: this.$t('subVPs')[i],
        };
        combinedVPs.push(singleVPPair);
      }
      return combinedVPs;
    },
    utmProps() {
      return {
        utmCampaign: this.utmCampaign,
        utmMedium: this.utmMedium,
        utmSource: this.utmSource,
      };
    },
  },
};
</script>

<style lang="scss" scoped>
.get-app-page {
  width: 100%;
  max-width: 1024px;
  margin-right: auto;
  margin-left: auto;

  .screen-wrapper {
    background-color: white;
    border-radius: 8px;
    width: 62%;
    max-width: 600px;
    margin-right: auto;
    margin-left: auto;

    @media screen and (max-width: 600px) {
      border-radius: 0px;
      width: 100%;
    }

    .separate-line {
      background-color: #d8d8d8;
      height: 1px;
      width: 80%;
    }

    .app-logo {
      padding-top: 20px;
      @media screen and (max-width: 600px) {
        display: inline-block;
        padding-bottom: 10px;
      }
    }

    .banner-container {
      margin-top: 100px;
      background-color: #f7f7f7 !important;
      @media screen and (max-width: 600px) {
        text-align: center;
      }
    }

    .top-container {
      @media screen and (max-width: 600px) {
        text-align: center;
      }
    }

    .footer-container {
      @media screen and (max-width: 600px) {
        text-align: center;
      }
    }

    .container {
      margin-left: 4rem;
      margin-right: 4rem;
      background-color: white;
      width: 100%;
      max-width: 600px;
      margin-right: auto;
      margin-left: auto;

      @media screen and (max-width: 600px) {
        @apply px-0;
      }
    }

    .center {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .download-badges {
      padding-top: 10px;
      padding-bottom: 20px;
      @media screen and (max-width: 600px) {
        text-align: center;
      }
    }

    .side-by-side {
      @apply py-16;
      display: flex;

      @media screen and (max-width: 600px) {
        max-width: 256px;
      }

      .icon-part {
        width: 38%;
        text-align: right;
        padding-right: 5%;

        img {
          display: inline;
        }

        @media screen and (max-width: 600px) {
          width: 20%;
          text-align: middle;
        }
      }

      .vp-part {
        width: 45%;

        @media screen and (max-width: 600px) {
          width: 80%;
          text-align: middle;
        }
      }
    }

    .slogan {
      @apply text-like-green;

      display: flex;
      flex-wrap: wrap;
      text-align: center;

      @media screen and (max-width: 600px) {
        margin-top: 0px;
        margin-bottom: 0px;
      }

      svg {
        max-height: 2.5rem;
        fill: currentColor;

        @apply my-8;
      }

      @media screen and (max-width: 600px) {
        max-width: 256px;
        display: inline-block;
      }
    }
    .slogan-text {
      color: #28646e;
      font-size: 24px;
      width: 100%;
      padding: 10px;

      @media screen and (max-width: 600px) {
        font-size: 18px;
      }
    }

    .feature {
      margin-top: 20px;
      margin-bottom: 4rem;
      padding-bottom: 20px;

      .main-vp {
        font-weight: bold;
        color: #28646e;
        font-size: 16px;
        padding: 0 5px;
      }

      .sub-vp {
        color: #4a4a4a;
        font-size: 14px;
        padding: 5px;
        line-height: 20px;
      }
    }

    .feature-image {
      display: block;
      width: 100%;
      margin: auto;
      border-radius: 10px 10px 0px 0px !important;
      margin-top: -80px;
      background-color: #28646e;

      @media screen and (max-width: 768px) {
        border-radius: 0px !important;
      }
    }

    .cross {
      z-index: 2;
      width: 21px;
      height: 22px;
      margin: -295px 0px 300px 32px;
      @media screen and (max-width: 600px) {
        width: 12px;
        height: 12.5px;
        margin: -75% 0% 53% -88%;
      }
    }
  }
}
</style>
