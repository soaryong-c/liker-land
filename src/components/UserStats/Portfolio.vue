<template>
  <UserStatsBase
    class="grid grid-cols-2 cursor-default gap-x-8 gap-y-4 text-medium-gray"
    :collected-class-ids="collectedClassIds"
    :created-class-ids="createdClassIds"
  >
    <template v-slot="stats">
      <ToolTips :tool-tip-text="$t('nft_portfolio_page_label_collected')">
        <Label preset="p6" class="font-200">
          <template #prepend>
            <IconMint />
          </template>
          {{ stats.collectedCount }}
        </Label>
      </ToolTips>
      <ToolTips :tool-tip-text="$t('nft_portfolio_page_state_value')">
        <Label preset="p6" class="font-200">
          <template #prepend>
            <IconPriceMini />
          </template>
          {{ stats.collectedAmount | formatNumber }}
        </Label>
      </ToolTips>
      <ToolTips :tool-tip-text="$t('nft_portfolio_page_label_created')">
        <Label preset="p6" class="font-200">
          <template #prepend>
            <IconFlare />
          </template>
          {{ isLoading ? '-' : stats.createdCount }}
        </Label>
      </ToolTips>
      <ToolTips :tool-tip-text="$t('nft_portfolio_page_state_collectors')">
        <Label preset="p6" class="font-200">
          <template #prepend>
            <IconPersonMini />
          </template>
          {{ isLoading ? '-' : stats.createdCollectorCount }}
        </Label>
      </ToolTips>
    </template>
  </UserStatsBase>
</template>
<script>
import { formatNumber } from '~/util/ui';

export default {
  filters: {
    formatNumber,
  },
  props: {
    collectedClassIds: {
      type: Array,
      default: () => [],
    },
    createdClassIds: {
      type: Array,
      default: () => [],
    },
    isLoading: {
      type: Boolean,
      default: false,
    },
  },
};
</script>
