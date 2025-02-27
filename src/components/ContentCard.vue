<template lang="pug">
  a.content-card(
    :href="href || src"
    :title="normalizedTitle"
    target="_blank"
    rel="noopener"
  )
    //- Header
    .content-card__inset.content-card__header
      .content-card__header-left
        Transition(
          :css="false"
          mode="out-in"
          @enter="onElemEnter"
          @leave="onElemLeave"
        )
          .content-card__author(v-if="authorId")
            LcAvatar.content-card__author-avatar(
              :src="resizedAuthorAvatarSrc"
              :halo="authorAvatarHalo"
            )
            | {{ authorName }}

          //- Placeholder
          .content-card__author-placeholder(v-else-if="!isBookmarked")
            .placeholder-shimmer.avatar
            .placeholder-shimmer.name.content-card__placeholder-text

      .content-card__header-right
        Transition(
          :css="false"
          mode="out-in"
          @enter="onElemEnter"
          @leave="onElemLeave"
        )
          span.content-card__like-count(
            v-if="likeCount !== -1"
            key="like-count"
          )
            | {{ formattedLikeCount }}
            LikeUnit

          //- Placeholder
          .placeholder-shimmer.content-card__like-count-placeholder(
            v-else-if="!isBookmarked"
            key="like-count-placeholder"
          )

    //- Cover Photo
    Transition(
      :css="false"
      @enter="onCoverPhotoEnter"
    )
      .content-card__cover-photo(
        v-if="coverSrc && coverPhotoSize.height"
      )
        img(
          :src="resizedCoverSrc"
          :alt="normalizedTitle"
        )

    //- Info
    Transition(
      :css="false"
      mode="out-in"
      @enter="onInfoEnter"
      @before-leave="onInfoBeforeLeave"
      @leave="onElemLeave"
    )
      .content-card__inset.content-card__info(
        v-if="normalizedTitle || description"
        key="info"
      )
        a.content-card__domain(
          :href="url.origin"
          target="_blank"
          rel="noopener"
        )
          | {{ url.hostname }}
        .content-card__title {{ normalizedTitle }}
        .content-card__description {{ description }}
      //- Empty content
      div(
        v-else-if="normalizedTitle === '' && description === ''"
        key="info-empty"
      )
      //- Placeholder
      .content-card__inset.placeholder-shimmer.content-card__info-placeholder(
        v-else
        key="info-placeholer"
      )
        .content-card__placeholder-text.domain
        .content-card__placeholder-text.title
        .content-card__placeholder-text.description
        .content-card__placeholder-text.description
        .content-card__placeholder-text.description

    //- Footer
    .content-card__inset.content-card__footer
      Transition(
        :css="false"
        @enter="onElemEnter"
        @leave="onElemLeave"
      )
        .content-card__action-bar(v-if="shouldShowActionBar")
          button.content-card__action-bar-button(
            @click.prevent="$emit('bookmark-click')"
          )
            BookmarkIcon(v-if="isBookmarked")
            BookmarkOutlinedIcon(v-else)

          v-popover(
            :open.sync="isOptionMenuOpen"
            :auto-hide="!isUpdatingFollow"
            trigger="manual"
            placement="auto"
            v-if="authorId"
          )
            button.content-card__action-bar-button(
              @click.prevent="onClickOptionButton"
            )
              MoreIcon

            ul.content-card-option-list(slot="popover")
              li.content-card-option-list-item
                LcLoadingIndicator.m-0.text-12(
                  v-if="isUpdatingFollow"
                )
                TickIcon.w-20(
                  v-else-if="isUpdatedFollow"
                )
                button.content-card-option-list-item__button(
                  v-else
                  @click="onToggleFollow"
                )
                  | {{ $t(isFollowed ? 'unfollow' : 'follow') }}
</template>

<script>
import { VPopover } from 'v-tooltip';
import parse from 'url-parse';

import { LIKE_CO_URL_BASE } from '~/constant';
import { getImageResizeAPI } from '~/util/api';

import LikeUnit from '~/assets/icons/like-unit.svg?inline';
import BookmarkIcon from '~/assets/icons/bookmark.svg?inline';
import BookmarkOutlinedIcon from '~/assets/icons/bookmark-outlined.svg?inline';
import MoreIcon from '~/assets/icons/more.svg?inline';
import TickIcon from '~/assets/icons/tick.svg?inline';

import { checkIsMobileClient } from '~/util/client';
import { getAvatarHaloTypeFromUser } from '~/util/user';

function getImageSize(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      resolve({
        width: image.width,
        height: image.height,
      });
    };
    image.onerror = reject;
    image.src = src;
  });
}

export default {
  components: {
    VPopover,
    LikeUnit,
    BookmarkIcon,
    BookmarkOutlinedIcon,
    MoreIcon,
    TickIcon,
  },
  props: {
    /* The URL of the content */
    src: {
      type: String,
      default: undefined,
    },
    /**
     * The link URL of the card
     */
    href: {
      type: String,
      default: undefined,
    },
    author: {
      type: Object,
      default: () => ({}),
    },
    /* The title of the content */
    title: {
      type: String,
      default: undefined,
    },
    /* The description of the content */
    description: {
      type: String,
      default: undefined,
    },
    /* The URL of the cover photo of the content */
    coverSrc: {
      type: String,
      default: undefined,
    },
    /* Total like of the content */
    likeCount: {
      type: Number,
      default: -1,
    },
    isBookmarked: {
      type: Boolean,
      default: false,
    },
    isFollowed: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      coverPhotoSize: {
        width: 0,
        height: 0,
      },
      isOptionMenuOpen: false,
      isUpdatingFollow: false,
      isUpdatedFollow: false,
    };
  },

  computed: {
    authorId() {
      return this.author.user;
    },
    authorName() {
      return this.author.displayName || this.authorId;
    },
    authorURL() {
      if (checkIsMobileClient()) {
        return this.src;
      }
      return `${LIKE_CO_URL_BASE}/${this.author.user}`;
    },
    authorAvatarHalo() {
      return getAvatarHaloTypeFromUser(this.author);
    },
    authorAvatarSrc() {
      return this.author.avatar;
    },
    url() {
      try {
        return parse(this.src);
      } catch (error) {
        return {};
      }
    },
    normalizedTitle() {
      if (this.isBookmarked) {
        return this.title || (this.src && decodeURI(this.src).split('?')[0]);
      }
      return this.title;
    },
    formattedLikeCount() {
      let { likeCount } = this;
      let suffix = '';
      if (likeCount > 1000) {
        likeCount = Math.floor(likeCount / 1000);
        suffix = 'k';
      }
      return `${likeCount.toLocaleString('en')}${suffix}`;
    },
    resizedCoverSrc() {
      if (!this.coverSrc) return undefined;
      return getImageResizeAPI(this.coverSrc);
    },
    resizedAuthorAvatarSrc() {
      if (!this.authorAvatarSrc) return undefined;
      return getImageResizeAPI(this.authorAvatarSrc, { width: 36 });
    },
    shouldShowActionBar() {
      return (
        this.isBookmarked ||
        (this.authorId &&
          (this.normalizedTitle !== undefined ||
            this.description !== undefined) &&
          this.coverSrc !== undefined)
      );
    },
  },

  watch: {
    resizedCoverSrc: 'fetchCoverInfo',
  },

  mounted() {
    this.fetchCoverInfo();
  },

  methods: {
    async fetchCoverInfo() {
      if (this.coverSrc) {
        try {
          this.coverPhotoSize = await getImageSize(this.resizedCoverSrc);
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error(error);
        }
      }
    },

    onElemEnter(el, done) {
      this.$gsap.TweenLite.fromTo(
        el,
        0.5,
        { opacity: 0 },
        {
          opacity: 1,
          ease: 'easeOutPower2',
          onComplete: () => {
            el.removeAttribute('style');
            done();
          },
        }
      );
    },
    onElemLeave(el, done) {
      this.$gsap.TweenLite.to(el, 0.25, {
        opacity: 1,
        ease: 'easeInPower2',
        onComplete: done,
      });
    },

    onCoverPhotoEnter(el, done) {
      // Expand the cover photo
      const { width, height } = this.coverPhotoSize;
      this.$gsap.TweenLite.fromTo(
        el,
        0.75,
        {
          height: 0,
          opacity: 0,
        },
        {
          height: (el.clientWidth / width) * height,
          opacity: 1,
          ease: 'easeOutPower2',
          onComplete: () => {
            el.removeAttribute('style');
            done();
          },
        }
      );
    },

    onInfoEnter(el, done) {
      this.$gsap.TweenLite.fromTo(
        el,
        0.5,
        {
          opacity: 0,
          height: this.infoLeavingHeight,
        },
        {
          opacity: 1,
          height: el.offsetHeight,
          ease: 'easeOutPower2',
          onComplete: () => {
            el.removeAttribute('style');
            done();
          },
        }
      );
    },
    onInfoBeforeLeave(el) {
      this.infoLeavingHeight = el.offsetHeight;
    },

    onClickOptionButton() {
      this.isUpdatedFollow = false;
      this.isOptionMenuOpen = true;
    },
    onToggleFollow() {
      this.isUpdatingFollow = true;
      this.$emit('toggle-follow', this.onUpdatedFollow);
    },
    onUpdatedFollow() {
      this.isUpdatingFollow = false;
      this.isUpdatedFollow = true;
      this.isOptionMenuOpen = false;
    },
  },
};
</script>

<style lang="scss">
.content-card {
  transition: opacity 0.2s ease-in-out;

  @apply block;
  @apply relative;

  @apply text-left;

  @apply bg-white;

  @apply border;
  @apply border-gray-e6;
  @apply rounded-8;

  &:hover {
    opacity: 0.75;
  }

  > * {
    &:first-child {
      border-top-left-radius: inherit;
      border-top-right-radius: inherit;
    }

    &:last-child {
      border-bottom-left-radius: inherit;
      border-bottom-right-radius: inherit;
    }
  }

  &__inset {
    border-left-width: 1rem;
    border-right-width: 1rem;

    border-top-width: 0.75rem;
    border-bottom-width: 0.75rem;

    @apply border-transparent;
    @apply border-solid;

    & + & {
      border-top-width: 0;
    }
  }

  &__placeholder-text {
    box-sizing: content-box;

    min-height: 0.5rem;

    border-color: currentColor;

    @apply text-white;

    @apply flex;
    @apply justify-between;

    &::before,
    &::after {
      content: '';

      @apply bg-current;
    }
  }

  &__header {
    @apply flex;

    &-left {
      @apply flex-grow;
    }

    &-left,
    &-right {
      @apply relative;

      @apply flex;
      @apply items-center;
    }
  }

  &__author {
    @apply inline-flex;
    @apply items-center;

    @apply text-18;
    @apply text-like-green;
    @apply font-600;

    a#{&}:hover {
      @apply text-like-green-dark;
    }

    &-avatar {
      width: 2.25rem;
      height: 2.25rem;

      @apply mr-8;

      .lc-avatar__content {
        width: inherit !important;
        height: inherit !important;
      }
    }

    &-placeholder {
      @apply flex;
      @apply flex-grow;

      .avatar {
        @apply w-36;
        @apply h-36;

        @apply rounded-full;
      }

      .name {
        border-top-width: 0.5rem;
        border-bottom-width: 0.5rem;

        width: 7.5rem;

        &::before {
          @apply w-8;
        }
      }
    }
  }

  &__like-count {
    line-height: 0.5;

    @apply text-14;
    @apply text-gray-4a;
    @apply font-600;

    @apply flex;
    @apply items-center;

    &-placeholder {
      @apply w-64;
      @apply h-16;
    }

    svg {
      width: 2rem;
      height: 0.85em;
      margin-bottom: 0.1rem;

      @apply ml-8;

      @apply fill-current;
    }
  }

  &__cover-photo {
    @apply relative;

    @apply truncate;

    @apply border;
    @apply border-l-0;
    @apply border-r-0;

    > img {
      @apply block;
      @apply object-cover;

      @apply min-w-full;
    }

    &:after {
      content: '';

      transition: background-color 0.2s ease-in-out;

      @apply absolute;
      @apply inset-0;

      @apply pointer-events-none;

      .content-card:hover & {
        background-color: rgba(0, 0, 0, 0.03);
      }
    }
  }

  &__info {
    &-placeholder {
      .domain {
        @apply h-14;

        &::after {
          width: 70%;
        }
      }

      .title {
        border-top-width: 0.5rem;
        border-bottom-width: 0.25em;

        @apply h-20;

        &::after {
          width: 20%;
        }
      }

      .description {
        border-top-width: 0.25rem;

        @apply h-16;

        &:last-child {
          &::after {
            width: 35%;
          }
        }
      }
    }
  }

  &__domain {
    @apply inline-block;

    @apply text-14;
    @apply text-gray-4a;

    &:hover {
      @apply text-gray-31;
      @apply underline;
    }
  }

  &__title {
    @apply text-20;
    @apply text-black;
    @apply font-600;
    @apply leading-1_25;
    @apply whitespace-normal;
    @apply break-words;

    @apply mt-4;
  }

  &__description {
    @apply text-14;
    @apply text-gray-4a;
    @apply leading-1_5;
    @apply whitespace-normal;
    @apply break-words;

    @apply mt-8;
  }

  &__footer {
    min-height: 1.5rem;
  }

  &__action-bar {
    @apply flex;
    @apply justify-end;

    > * {
      &:not(:first-child) {
        @apply ml-12;
      }
    }

    &-button {
      transition-property: color, opacity, transform;
      transition-duration: 0.2s;
      transition-timing-function: ease;

      @apply relative;

      @apply text-gray-4a;

      @apply w-24;
      @apply h-24;

      &:hover {
        @apply text-like-green;
      }

      &:active {
        transform: translateY(1px);

        @apply text-like-green-dark;
      }

      svg {
        @apply absolute;
        @apply inset-0;

        @apply fill-current;
      }
    }
  }

  &-option-list {
    min-width: 10rem;

    @apply overflow-hidden;

    @apply list-disc;

    @apply bg-white;
    @apply rounded-[8px];

    &-item {
      @apply flex;
      @apply justify-center;
      @apply items-center;

      @apply text-14;
      @apply text-center;

      @apply h-36;

      &__button {
        height: inherit;

        transition-property: opacity, background-color;
        transition-duration: 0.15s;
        transition-timing-function: ease;

        @apply flex-grow;

        &:hover {
          background: rgba(black, 0.05);

          @apply opacity-50;

          @apply px-16;
        }

        &:active {
          @apply opacity-25;
        }
      }
    }
  }
}
</style>
