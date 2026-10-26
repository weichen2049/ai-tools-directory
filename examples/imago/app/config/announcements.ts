export type Announcement = {
  id: string;
  title: string;
  title_en?: string;
  description: string;
  description_en?: string;
  link?: {
    href: string;
    label: string;
    label_en?: string;
  };
  startsAt?: string;
  endsAt?: string;
  active?: boolean;
};

export const ANNOUNCEMENTS: Announcement[] = [
  {
    id: "2026-01-11T20:10:00+08:00",
    title: "视频生成上线",
    title_en: "Video Gen Live",
    description: "功能性生图模型与视频生成现已上线！支持超高自由度生成、NSFW 无修内容及 1080p 高清视频制作。Image/Video 每日享免费额度。",
    description_en: "Functional image models and video generation are now live! Experience high-freedom generation, NSFW uncensored content, and 1080p HD video creation. Image/Video tiers enjoy daily free credits.",
    startsAt: "2026-01-11T12:00:00+08:00"
  }
];