import {
  AppleIcon,
  DiscordIcon,
  DropboxIcon,
  FacebookIcon,
  GitHubIcon,
  GitLabIcon,
  GoogleIcon,
  KickIcon,
  LinkedInIcon,
  MicrosoftIcon,
  type ProviderIcon,
  RedditIcon,
  RobloxIcon,
  SpotifyIcon,
  TikTokIcon,
  TwitchIcon,
  VKIcon,
  XIcon,
  ZoomIcon,
} from '@deepcrawl/ui/components/icons/provider-icons';

export const socialProviders = [
  {
    providerId: 'apple',
    name: 'Apple',
    icon: AppleIcon,
  },
  {
    providerId: 'discord',
    name: 'Discord',
    icon: DiscordIcon,
  },
  {
    providerId: 'dropbox',
    name: 'Dropbox',
    icon: DropboxIcon,
  },
  {
    providerId: 'facebook',
    name: 'Facebook',
    icon: FacebookIcon,
  },
  {
    providerId: 'github',
    name: 'GitHub',
    icon: GitHubIcon,
  },
  {
    providerId: 'gitlab',
    name: 'GitLab',
    icon: GitLabIcon,
  },
  {
    providerId: 'google',
    name: 'Google',
    icon: GoogleIcon,
  },
  {
    providerId: 'kick',
    name: 'Kick',
    icon: KickIcon,
  },
  {
    providerId: 'linkedin',
    name: 'LinkedIn',
    icon: LinkedInIcon,
  },
  {
    providerId: 'microsoft',
    name: 'Microsoft',
    icon: MicrosoftIcon,
  },
  {
    providerId: 'reddit',
    name: 'Reddit',
    icon: RedditIcon,
  },
  {
    providerId: 'roblox',
    name: 'Roblox',
    icon: RobloxIcon,
  },
  {
    providerId: 'spotify',
    name: 'Spotify',
    icon: SpotifyIcon,
  },
  {
    providerId: 'tiktok',
    name: 'TikTok',
    icon: TikTokIcon,
  },
  {
    providerId: 'twitch',
    name: 'Twitch',
    icon: TwitchIcon,
  },
  {
    providerId: 'vk',
    name: 'VK',
    icon: VKIcon,
  },
  {
    providerId: 'twitter',
    name: 'X',
    icon: XIcon,
  },
  {
    providerId: 'zoom',
    name: 'Zoom',
    icon: ZoomIcon,
  },
] as const satisfies Provider[];

export type Provider = {
  providerId: string;
  name: string;
  icon?: ProviderIcon;
};
