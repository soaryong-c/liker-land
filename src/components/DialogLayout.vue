<template lang="pug">
  .page-layout.page-layout--dialog
    slot(name="site-logo")
      .site-logo-wrapper
        NuxtLink.site-logo(:to="getHomeRoute")
          LikerLandLogo
    slot(name="page-wrapper")
      .page-wrapper
        slot(name="header")
          header.page-header
            slot(name="header-content")
              LikerLogo.liker-logo
        slot(name="body")
</template>

<script>
import { mapGetters } from 'vuex';

import LikerLandLogo from '~/assets/icons/logo.svg?inline';
import LikerLogo from '~/assets/images/liker-logo.svg?inline';

export default {
  name: 'DialogLayout',
  components: {
    LikerLandLogo,
    LikerLogo,
  },
  computed: {
    ...mapGetters(['getHomeRoute']),
  },
};
</script>


<style lang="scss">
.page-layout--dialog {
  box-sizing: border-box;
  @apply px-16;
  @apply py-48;

  @apply bg-gray-f7;

  @apply min-h-screen;

  .site-logo {
    @apply inline-block;

    &-wrapper {
      @apply text-center;
      @apply mb-52;
    }
  }

  .page-wrapper {
    @apply mx-auto;

    @apply w-full;
    @apply min-h-0;
    @apply max-w-phone;
  }

  .page-header {
    @apply text-center;

    @apply rounded-t-[8px];
    @apply bg-like-gradient;

    .liker-logo {
      @apply -mt-40;
      @apply mb-40;
      @apply mx-auto;

      @apply w-80;
    }
  }

  .page-content:not(#{&}) {
    @apply grow-0;

    @apply text-like-green;
    @apply text-center;

    @apply bg-white;

    @apply rounded-b-[8px];

    @apply mb-32;
    @apply p-24;
  }
}
</style>
