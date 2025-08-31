export type AdType = "banner"|"interstitial"|"rewarded";
export interface AdCaps {
  bannerPerMinute: number;
  interstitialPer10Min: number;
  rewardedPerHour: number;
}
export const DEFAULT_CAPS: AdCaps = {
  bannerPerMinute: 2,
  interstitialPer10Min: 1,
  rewardedPerHour: 2,
};
