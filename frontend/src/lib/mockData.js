export const MOCK_TIMELINE_DATA = {
  meta: {
    totalArticles: 56,
    totalClusters: 10,
    sourceCount: 4,
    sources: ['BBC', 'NPR', 'Reuters', 'Guardian'],
    windowStart: '2026-09-21T05:00:00Z',
    windowEnd: '2026-09-21T19:00:00Z',
    lastUpdated: '2026-09-21T18:40:00Z'
  },
  sourceCounts: {
    BBC: 17,
    NPR: 13,
    Reuters: 15,
    Guardian: 11
  },
  coverage: [
    { hour: '2026-09-21T05:00:00Z', count: 2 },
    { hour: '2026-09-21T06:00:00Z', count: 4 },
    { hour: '2026-09-21T07:00:00Z', count: 5 },
    { hour: '2026-09-21T08:00:00Z', count: 6 },
    { hour: '2026-09-21T09:00:00Z', count: 7 },
    { hour: '2026-09-21T10:00:00Z', count: 4 },
    { hour: '2026-09-21T11:00:00Z', count: 5 },
    { hour: '2026-09-21T12:00:00Z', count: 8 },
    { hour: '2026-09-21T13:00:00Z', count: 13 }, // Peak coverage hour
    { hour: '2026-09-21T14:00:00Z', count: 9 },
    { hour: '2026-09-21T15:00:00Z', count: 7 },
    { hour: '2026-09-21T16:00:00Z', count: 5 },
    { hour: '2026-09-21T17:00:00Z', count: 4 },
    { hour: '2026-09-21T18:00:00Z', count: 3 }
  ],
  clusters: [
    {
      id: 1,
      label: 'Typhoon Nari makes landfall in Kyushu, Japan',
      startTime: '2026-09-21T05:50:00Z',
      endTime: '2026-09-21T18:40:00Z',
      articleCount: 8,
      sources: ['BBC', 'NPR', 'Reuters', 'Guardian'],
      isLive: true,
      articles: [
        { id: 101, publishedAt: '2026-09-21T05:50:00Z', source: 'BBC' },
        { id: 102, publishedAt: '2026-09-21T07:20:00Z', source: 'NPR' },
        { id: 103, publishedAt: '2026-09-21T09:15:00Z', source: 'Reuters' },
        { id: 104, publishedAt: '2026-09-21T11:30:00Z', source: 'Guardian' },
        { id: 105, publishedAt: '2026-09-21T13:10:00Z', source: 'BBC' },
        { id: 106, publishedAt: '2026-09-21T15:00:00Z', source: 'Reuters' },
        { id: 107, publishedAt: '2026-09-21T16:45:00Z', source: 'NPR' },
        { id: 108, publishedAt: '2026-09-21T18:40:00Z', source: 'Guardian' }
      ]
    },
    {
      id: 2,
      label: 'US Senate advances bipartisan immigration reform bill',
      startTime: '2026-09-21T06:15:00Z',
      endTime: '2026-09-21T17:30:00Z',
      articleCount: 7,
      sources: ['BBC', 'NPR', 'Reuters'],
      isLive: false,
      articles: [
        { id: 201, publishedAt: '2026-09-21T06:15:00Z', source: 'NPR' },
        { id: 202, publishedAt: '2026-09-21T08:30:00Z', source: 'Reuters' },
        { id: 203, publishedAt: '2026-09-21T10:00:00Z', source: 'BBC' },
        { id: 204, publishedAt: '2026-09-21T12:20:00Z', source: 'NPR' },
        { id: 205, publishedAt: '2026-09-21T14:15:00Z', source: 'Reuters' },
        { id: 206, publishedAt: '2026-09-21T16:00:00Z', source: 'BBC' },
        { id: 207, publishedAt: '2026-09-21T17:30:00Z', source: 'Reuters' }
      ]
    },
    {
      id: 3,
      label: 'ECB holds benchmark interest rates steady amid slowing inflation',
      startTime: '2026-09-21T08:00:00Z',
      endTime: '2026-09-21T16:10:00Z',
      articleCount: 6,
      sources: ['BBC', 'Reuters', 'Guardian'],
      isLive: false,
      articles: [
        { id: 301, publishedAt: '2026-09-21T08:00:00Z', source: 'Reuters' },
        { id: 302, publishedAt: '2026-09-21T09:45:00Z', source: 'BBC' },
        { id: 303, publishedAt: '2026-09-21T11:20:00Z', source: 'Guardian' },
        { id: 304, publishedAt: '2026-09-21T13:00:00Z', source: 'Reuters' },
        { id: 305, publishedAt: '2026-09-21T14:50:00Z', source: 'BBC' },
        { id: 306, publishedAt: '2026-09-21T16:10:00Z', source: 'Guardian' }
      ]
    },
    {
      id: 4,
      label: 'SpaceX Starship completes fifth orbital test launch',
      startTime: '2026-09-21T11:00:00Z',
      endTime: '2026-09-21T18:30:00Z',
      articleCount: 6,
      sources: ['BBC', 'NPR', 'Reuters', 'Guardian'],
      isLive: true,
      articles: [
        { id: 401, publishedAt: '2026-09-21T11:00:00Z', source: 'Reuters' },
        { id: 402, publishedAt: '2026-09-21T12:30:00Z', source: 'BBC' },
        { id: 403, publishedAt: '2026-09-21T13:45:00Z', source: 'NPR' },
        { id: 404, publishedAt: '2026-09-21T15:20:00Z', source: 'Guardian' },
        { id: 405, publishedAt: '2026-09-21T17:00:00Z', source: 'Reuters' },
        { id: 406, publishedAt: '2026-09-21T18:30:00Z', source: 'BBC' }
      ]
    },
    {
      id: 5,
      label: 'Global AI & Tech Safety Summit opens in Geneva',
      startTime: '2026-09-21T07:00:00Z',
      endTime: '2026-09-21T15:30:00Z',
      articleCount: 5,
      sources: ['NPR', 'Reuters', 'Guardian'],
      isLive: false,
      articles: [
        { id: 501, publishedAt: '2026-09-21T07:00:00Z', source: 'Guardian' },
        { id: 502, publishedAt: '2026-09-21T09:30:00Z', source: 'Reuters' },
        { id: 503, publishedAt: '2026-09-21T11:15:00Z', source: 'NPR' },
        { id: 504, publishedAt: '2026-09-21T13:40:00Z', source: 'Guardian' },
        { id: 505, publishedAt: '2026-09-21T15:30:00Z', source: 'Reuters' }
      ]
    },
    {
      id: 6,
      label: 'Crude oil prices rise following OPEC+ production meeting',
      startTime: '2026-09-21T09:00:00Z',
      endTime: '2026-09-21T14:45:00Z',
      articleCount: 4,
      sources: ['BBC', 'Reuters'],
      isLive: false,
      articles: [
        { id: 601, publishedAt: '2026-09-21T09:00:00Z', source: 'Reuters' },
        { id: 602, publishedAt: '2026-09-21T10:45:00Z', source: 'BBC' },
        { id: 603, publishedAt: '2026-09-21T12:50:00Z', source: 'Reuters' },
        { id: 604, publishedAt: '2026-09-21T14:45:00Z', source: 'BBC' }
      ]
    },
    {
      id: 7,
      label: 'UN Climate Council releases regional mitigation report',
      startTime: '2026-09-21T10:30:00Z',
      endTime: '2026-09-21T17:15:00Z',
      articleCount: 5,
      sources: ['BBC', 'NPR', 'Guardian'],
      isLive: false,
      articles: [
        { id: 701, publishedAt: '2026-09-21T10:30:00Z', source: 'Guardian' },
        { id: 702, publishedAt: '2026-09-21T12:00:00Z', source: 'BBC' },
        { id: 703, publishedAt: '2026-09-21T13:50:00Z', source: 'NPR' },
        { id: 704, publishedAt: '2026-09-21T15:40:00Z', source: 'Guardian' },
        { id: 705, publishedAt: '2026-09-21T17:15:00Z', source: 'BBC' }
      ]
    },
    {
      id: 8,
      label: 'Japan announces $10B semiconductor research subsidy',
      startTime: '2026-09-21T06:40:00Z',
      endTime: '2026-09-21T13:20:00Z',
      articleCount: 4,
      sources: ['BBC', 'Reuters', 'NPR'],
      isLive: false,
      articles: [
        { id: 801, publishedAt: '2026-09-21T06:40:00Z', source: 'BBC' },
        { id: 802, publishedAt: '2026-09-21T08:50:00Z', source: 'Reuters' },
        { id: 803, publishedAt: '2026-09-21T11:05:00Z', source: 'NPR' },
        { id: 804, publishedAt: '2026-09-21T13:20:00Z', source: 'Reuters' }
      ]
    },
    {
      id: 9,
      label: 'NATO allies sign joint cybersecurity framework agreement',
      startTime: '2026-09-21T12:15:00Z',
      endTime: '2026-09-21T18:10:00Z',
      articleCount: 6,
      sources: ['BBC', 'NPR', 'Reuters', 'Guardian'],
      isLive: true,
      articles: [
        { id: 901, publishedAt: '2026-09-21T12:15:00Z', source: 'Guardian' },
        { id: 902, publishedAt: '2026-09-21T13:30:00Z', source: 'BBC' },
        { id: 903, publishedAt: '2026-09-21T14:45:00Z', source: 'Reuters' },
        { id: 904, publishedAt: '2026-09-21T16:00:00Z', source: 'NPR' },
        { id: 905, publishedAt: '2026-09-21T17:15:00Z', source: 'Guardian' },
        { id: 906, publishedAt: '2026-09-21T18:10:00Z', source: 'BBC' }
      ]
    },
    {
      id: 10,
      label: 'Global aviation safety authority issues software advisory',
      startTime: '2026-09-21T14:00:00Z',
      endTime: '2026-09-21T18:00:00Z',
      articleCount: 5,
      sources: ['BBC', 'NPR', 'Reuters'],
      isLive: false,
      articles: [
        { id: 1001, publishedAt: '2026-09-21T14:00:00Z', source: 'Reuters' },
        { id: 1002, publishedAt: '2026-09-21T15:10:00Z', source: 'BBC' },
        { id: 1003, publishedAt: '2026-09-21T16:25:00Z', source: 'NPR' },
        { id: 1004, publishedAt: '2026-09-21T17:15:00Z', source: 'Reuters' },
        { id: 1005, publishedAt: '2026-09-21T18:00:00Z', source: 'BBC' }
      ]
    }
  ]
};

export const MOCK_CLUSTER_DETAILS = {
  1: {
    cluster: {
      id: 1,
      label: 'Typhoon Nari makes landfall in Kyushu, Japan',
      articleCount: 8,
      sourceCount: 4,
      sources: ['BBC', 'NPR', 'Reuters', 'Guardian'],
      startTime: '2026-09-21T05:50:00Z',
      endTime: '2026-09-21T18:40:00Z',
      activeDuration: '12h 50m',
      peakCoverage: '13:00 – 15:00',
      isLive: true,
      articles: [
        {
          id: 101,
          title: 'Typhoon Nari makes landfall in southern Japan with severe winds',
          source: 'BBC',
          publishedAt: '2026-09-21T05:50:00Z',
          url: 'https://www.bbc.com/news/world-asia-101',
          description: 'A powerful category 3 typhoon has hit the island of Kyushu, causing widespread power outages and flight cancellations across regional hubs.'
        },
        {
          id: 102,
          title: 'Japan issues evacuation advisories for thousands as Typhoon Nari arrives',
          source: 'NPR',
          publishedAt: '2026-09-21T07:20:00Z',
          url: 'https://www.npr.org/2026/09/21/japan-typhoon-nari',
          description: 'Emergency management officials in Kagoshima prefecture urged residents along low-lying coastal areas to seek immediate shelter.'
        },
        {
          id: 103,
          title: 'Kyushu bullet train services suspended as typhoon batters southern coast',
          source: 'Reuters',
          publishedAt: '2026-09-21T09:15:00Z',
          url: 'https://www.reuters.com/world/asia-pacific/japan-typhoon-transport-103',
          description: 'Rail operators suspended Shinkansen high-speed train services throughout Kyushu as gusting winds topped 160 kilometers per hour.'
        },
        {
          id: 104,
          title: 'Heavy rain warnings extended to central Japan as Typhoon Nari moves north',
          source: 'Guardian',
          publishedAt: '2026-09-21T11:30:00Z',
          url: 'https://www.theguardian.com/world/2026/sep/21/typhoon-nari-japan-rain',
          description: 'Meteorologists warn that rainfall totals could exceed 400mm over 24 hours as the typhoon tracks slowly north-northeast towards Honshu.'
        },
        {
          id: 105,
          title: 'Power crews work through storm to restore electricity in Kyushu',
          source: 'BBC',
          publishedAt: '2026-09-21T13:10:00Z',
          url: 'https://www.bbc.com/news/world-asia-105',
          description: 'Over 120,000 households remain without power as utility engineers deploy emergency generators to critical infrastructure.'
        },
        {
          id: 106,
          title: 'Airlines cancel over 300 domestic flights across Japanese airports',
          source: 'Reuters',
          publishedAt: '2026-09-21T15:00:00Z',
          url: 'https://www.reuters.com/business/aerospace-defense/japan-flights-typhoon-106',
          description: 'Japan Airlines and All Nippon Airways grounded hundreds of domestic flights as peripheral wind gusts affected Tokyo airports.'
        },
        {
          id: 107,
          title: 'Disaster relief units deployed to assist flood-stricken towns in Japan',
          source: 'NPR',
          publishedAt: '2026-09-21T16:45:00Z',
          url: 'https://www.npr.org/2026/09/21/japan-relief-units',
          description: 'Self-Defense Force personnel have arrived with amphibious vehicles to assist in search and rescue operations.'
        },
        {
          id: 108,
          title: 'Typhoon Nari weakens to tropical storm as it approaches Sea of Japan',
          source: 'Guardian',
          publishedAt: '2026-09-21T18:40:00Z',
          url: 'https://www.theguardian.com/world/2026/sep/21/typhoon-nari-weakens',
          description: 'Atmospheric pressure readings indicate Typhoon Nari has begun degrading into a severe tropical storm as wind speeds decrease.'
        }
      ]
    }
  }
};
